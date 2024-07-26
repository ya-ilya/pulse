package org.pulse.backend.requests

import java.util.*

class CreateGroupChatRequest(
    val name: String,
    val with: List<UUID> = emptyList()
)