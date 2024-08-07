package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class DeletePostEvent(
    val channelId: Long,
    val postId: Long
) : GatewayEvent