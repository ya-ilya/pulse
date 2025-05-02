package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class CreateChannelRequest(
    @field:Size(min = 4, max = 64)
    val name: String
)