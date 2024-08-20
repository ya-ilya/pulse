package org.pulse.backend.controllers

import org.pulse.backend.entities.user.User
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
    fun getUserById(@PathVariable userId: UUID): User {
        return userService.getUserById(userId)
    }

    @GetMapping("/by-username/{username}")
    fun getUserByUsername(@PathVariable username: String): User {
        return userService.getUserByUsername(username)
    }
}