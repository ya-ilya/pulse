package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class UpdateChannelRequest(
    @Size(min = 4, max = 64)
    val name: String
)