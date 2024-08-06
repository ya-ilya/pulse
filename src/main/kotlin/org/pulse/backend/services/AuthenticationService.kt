package org.pulse.backend.services

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.pulse.backend.responses.AuthenticationResponse
import org.pulse.backend.entities.user.User
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.*
import javax.crypto.SecretKey

@Service
class AuthenticationService(
    private val userService: UserService,
    private val passwordEncoder: PasswordEncoder
) {
    @Value("\${token.signing.key}")
    private val jwtSigningKey: String? = null

    fun signIn(email: String, password: String): AuthenticationResponse {
        val user = userService
            .findUserByEmail(email)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }


        if (!passwordEncoder.matches(password, user.password)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }

        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(
            user,
            user.password
        )

        return AuthenticationResponse(
            generateAccessToken(user)!!,
            generateRefreshToken(user)!!,
            user.id!!
        )
    }

    fun signUp(username: String, email: String, password: String): AuthenticationResponse {
        if (userService.findUserByEmail(email).isPresent) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }

        val user = userService.createUser(
            username,
            email,
            password
        )

        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(
            user,
            user.password
        )

        return AuthenticationResponse(
            generateAccessToken(user)!!,
            generateRefreshToken(user)!!,
            user.id!!
        )
    }

    fun refreshToken(refreshToken: String): AuthenticationResponse {
        val user = userService
            .findUserByRefreshToken(refreshToken)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }

        if (!isRefreshTokenValid(refreshToken, user)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }

        return AuthenticationResponse(
            generateAccessToken(user)!!,
            generateRefreshToken(user)!!,
            user.id!!
        )
    }

    fun generateAccessToken(user: User): String? {
        return generateToken(
            1 * 24 * 60 * 60 * 1000, // 1 DAY
            mapOf("id" to user.id!!),
            user
        )?.also {
            user.accessToken = passwordEncoder.encode(it)
            userService.updateUser(user)
        }
    }

    fun generateRefreshToken(user: User): String? {
        return generateToken(
            16 * 24 * 60 * 60 * 1000, // 16 DAYS
            mapOf("id" to user.id!!),
            user
        )?.also {
            user.refreshToken = passwordEncoder.encode(it)
            userService.updateUser(user)
        }
    }

    fun isAccessTokenValid(accessToken: String, user: User): Boolean {
        val email = extractEmail(accessToken)
        if (email != user.email) return false
        if (!passwordEncoder.matches(accessToken, user.accessToken)) return false
        if (isTokenExpired(accessToken)) {
            user.accessToken = null
            return false
        }
        return true
    }

    fun isRefreshTokenValid(refreshToken: String, user: User): Boolean {
        val email = extractEmail(refreshToken)
        if (email != user.email) return false
        if (!passwordEncoder.matches(refreshToken, user.refreshToken)) return false
        if (isTokenExpired(refreshToken)) {
            user.refreshToken = null
            return false
        }
        return true
    }

    fun extractEmail(token: String): String {
        return extractClaim<String>(token, Claims::getSubject)
    }

    private fun <T> extractClaim(token: String, claimsResolvers: (Claims) -> T): T {
        val claims: Claims = extractAllClaims(token)
        return claimsResolvers(claims)
    }

    private fun generateToken(
        timeInMilliseconds: Long,
        extraClaims: Map<String, Any>,
        user: User
    ): String? {
        return Jwts.builder()
            .claims(extraClaims)
            .subject(user.email)
            .issuedAt(Date(System.currentTimeMillis()))
            .expiration(Date(System.currentTimeMillis() + timeInMilliseconds))
            .signWith(getSigningKey())
            .compact()
    }

    private fun isTokenExpired(token: String): Boolean {
        return extractExpiration(token).before(Date())
    }

    private fun extractExpiration(token: String): Date {
        return extractClaim<Date>(token, Claims::getExpiration)
    }

    private fun extractAllClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .payload
    }

    private fun getSigningKey(): SecretKey? {
        val keyBytes: ByteArray = Decoders.BASE64.decode(jwtSigningKey)
        return Keys.hmacShaKeyFor(keyBytes)
    }
}