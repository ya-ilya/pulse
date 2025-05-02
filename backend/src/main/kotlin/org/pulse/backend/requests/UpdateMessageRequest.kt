package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class UpdateMessageRequest(
    @field:Size(min = 3)
    val content: String
)