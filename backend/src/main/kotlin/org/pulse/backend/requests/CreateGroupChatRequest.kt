package org.pulse.backend.requests

import jakarta.validation.constraints.Size
import java.util.*

class CreateGroupChatRequest(
    @Size(min = 4, max = 64)
    val name: String,
    val with: List<UUID> = emptyList()
)