package org.pulse.backend.controllers

import org.pulse.backend.entities.user.User
import org.pulse.backend.services.UserService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {
    @GetMapping("/{userId}")
    fun getUserById(userId: UUID): User {
        return userService.getUserById(userId)
    }
}