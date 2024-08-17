package org.pulse.backend.services

import org.pulse.backend.entities.user.User
import org.pulse.backend.entities.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : UserDetailsService {
    fun getUserById(userId: UUID): User {
        return userRepository
            .findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "User not found") }
    }

    fun findUserByUsername(username: String): Optional<User> {
        return userRepository.findByUsername(username)
    }

    fun findUserByEmail(email: String): Optional<User> {
        return userRepository.findByEmail(email)
    }

    fun findUserByRefreshToken(refreshToken: String): Optional<User> {
        return userRepository.findByRefreshToken(refreshToken)
    }

    fun createUser(username: String, email: String, password: String): User {
        return userRepository.save(
            User(
                username,
                username,
                email,
                passwordEncoder.encode(password)
            )
        )
    }

    fun updateUser(user: User): User {
        return userRepository.save(user)
    }

    override fun loadUserByUsername(username: String): UserDetails {
        return userRepository
            .findByEmail(username)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }
    }
}