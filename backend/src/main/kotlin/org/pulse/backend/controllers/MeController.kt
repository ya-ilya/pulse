package org.pulse.backend.controllers

import jakarta.validation.Valid
import org.pulse.backend.entities.user.User
import org.pulse.backend.requests.UpdateDisplayNameRequest
import org.pulse.backend.responses.UserResponse
import org.pulse.backend.services.UserService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/me")
class MeController(private val userService: UserService) {
    @GetMapping
    fun getUser(@AuthenticationPrincipal user: User): UserResponse =
        user.toResponse()

    @PatchMapping("/displayName")
    fun updateDisplayName(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: UpdateDisplayNameRequest
    ): UserResponse =
        userService.updateDisplayName(user, request.displayName).toResponse()
}