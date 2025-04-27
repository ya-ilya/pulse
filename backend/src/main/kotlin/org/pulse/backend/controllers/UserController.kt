package org.pulse.backend.controllers

import org.pulse.backend.responses.UserResponse
import org.pulse.backend.services.UserService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {
    @GetMapping("/{userId}")
    fun getUserById(@PathVariable userId: UUID): UserResponse {
        return userService.getUserById(userId).toResponse()
    }

    @GetMapping("/by-username/{username}")
    fun getUserByUsername(@PathVariable username: String): UserResponse {
        return userService.getUserByUsername(username).toResponse()
    }
}