package org.pulse.backend.requests

import jakarta.validation.constraints.Size

class UpdateDisplayNameRequest(
    @field:Size(min = 4, max = 64)
    val displayName: String
)