package org.pulse.backend.controllers

import org.pulse.backend.requests.RefreshTokenRequest
import org.pulse.backend.requests.SignInRequest
import org.pulse.backend.requests.SignUpRequest
import org.pulse.backend.responses.AuthenticationResponse
import org.pulse.backend.services.AuthenticationService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/authentication")
class AuthenticationController(private val authenticationService: AuthenticationService) {
    @PostMapping("/sign-in")
    fun signIn(@RequestBody request: SignInRequest): AuthenticationResponse {
        return authenticationService.signIn(request.email, request.password)
    }

    @PostMapping("/sign-up")
    fun signUp(@RequestBody request: SignUpRequest): AuthenticationResponse {
        return authenticationService.signUp(request.username, request.email, request.password)
    }

    @PostMapping("/refreshToken")
    fun refreshToken(@RequestBody request: RefreshTokenRequest): AuthenticationResponse {
        return authenticationService.refreshToken(request.refreshToken)
    }
}