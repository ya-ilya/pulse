package org.pulse.backend.controllers

import jakarta.validation.Valid
import org.pulse.backend.entities.user.User
import org.pulse.backend.requests.UpdateDisplayNameRequest
import org.pulse.backend.requests.UpdateUsernameRequest
import org.pulse.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/me")
class MeController(private val userService: UserService) {
    @GetMapping
    fun getUser(@AuthenticationPrincipal user: User): User {
        return user
    }

    @PatchMapping("/username")
    fun updateUsername(@AuthenticationPrincipal user: User, @Valid @RequestBody request: UpdateUsernameRequest): User {
        if (userService.findUserByUsername(request.username).isPresent) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }

        return userService.updateUser(user.apply { this.username = request.username })
    }

    @PatchMapping("/displayName")
    fun updateDisplayName(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: UpdateDisplayNameRequest
    ): User {
        return userService.updateUser(user.apply { this.username = request.displayName })
    }
}