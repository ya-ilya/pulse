package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class CreateMessageRequest(
    @field:Size(min = 3)
    val content: String
)