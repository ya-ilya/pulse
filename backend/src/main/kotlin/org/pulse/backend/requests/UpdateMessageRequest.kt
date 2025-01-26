package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class UpdateMessageRequest(
    @Size(min = 3)
    val content: String
)