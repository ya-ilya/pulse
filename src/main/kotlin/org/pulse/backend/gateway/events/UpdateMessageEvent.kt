package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdateMessageEvent(
    val channelId: Long,
    val messageId: Long
) : GatewayEvent