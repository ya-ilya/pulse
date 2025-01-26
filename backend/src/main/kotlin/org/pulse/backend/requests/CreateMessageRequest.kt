package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class CreateMessageRequest(
    @Size(min = 3)
    val content: String
)