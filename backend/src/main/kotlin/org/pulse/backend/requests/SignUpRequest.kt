package org.pulse.backend.requests

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size

class SignUpRequest(
    @field:Size(min = 2, max = 20)
    val username: String,
    @field:Email
    val email: String,
    @field:Size(min = 8, max = 100)
    val password: String
)