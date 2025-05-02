package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class UpdateChannelRequest(
    @field:Size(min = 4, max = 64)
    val name: String
)