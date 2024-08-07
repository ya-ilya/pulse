package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdatePostEvent(
    val channelId: Long,
    val postId: Long
) : GatewayEvent