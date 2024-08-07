package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class CreateMessageEvent(
    val channelId: Long,
    val messageId: Long
) : GatewayEvent