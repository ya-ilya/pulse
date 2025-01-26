package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class UpdateUsernameRequest(
    @Size(min = 2, max = 20)
    val username: String
)