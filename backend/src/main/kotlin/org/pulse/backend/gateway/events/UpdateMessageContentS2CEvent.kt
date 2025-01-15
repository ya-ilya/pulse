package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdateMessageContentS2CEvent(
    val channelId: Long,
    val messageId: Long,
    val content: String
) : GatewayEvent