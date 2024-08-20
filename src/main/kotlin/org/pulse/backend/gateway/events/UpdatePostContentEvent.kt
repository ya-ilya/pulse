package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdatePostContentEvent(
    val channelId: Long,
    val postId: Long,
    val content: String
) : GatewayEvent