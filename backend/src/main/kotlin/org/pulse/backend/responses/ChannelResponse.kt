package org.pulse.backend.responses

import org.pulse.backend.entities.channel.ChannelType

class ChannelResponse(
    val type: ChannelType?,
    val name: String?,
    val admin: UserResponse?,
    val id: Long
)