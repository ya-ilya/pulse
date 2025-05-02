package org.pulse.backend.requests

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size

class SignInRequest(
    @field:Email
    val email: String,
    @field:Size(min = 8, max = 100)
    val password: String
)