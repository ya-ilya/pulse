package org.pulse.backend.controllers

import jakarta.validation.Valid
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
    fun signIn(@Valid @RequestBody request: SignInRequest): AuthenticationResponse =
        authenticationService.signIn(request.email, request.password)

    @PostMapping("/sign-up")
    fun signUp(@Valid @RequestBody request: SignUpRequest): AuthenticationResponse =
        authenticationService.signUp(request.username, request.email, request.password)

    @PostMapping("/refreshToken")
    fun refreshToken(@Valid @RequestBody request: RefreshTokenRequest): AuthenticationResponse =
        authenticationService.refreshToken(request.refreshToken)
}