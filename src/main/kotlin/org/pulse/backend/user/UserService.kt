package org.pulse.backend.user

import org.springframework.stereotype.Service

@Service
class UserService(private val userRepository: UserRepository)