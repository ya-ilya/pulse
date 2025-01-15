package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class DeleteMessageS2CEvent(
    val channelId: Long,
    val messageId: Long
) : GatewayEvent