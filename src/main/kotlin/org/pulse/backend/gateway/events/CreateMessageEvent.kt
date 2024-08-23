package org.pulse.backend.gateway.events

import org.pulse.backend.entities.message.Message
import org.pulse.backend.gateway.GatewayEvent

class CreateMessageEvent(
    val channelId: Long,
    val message: Message
) : GatewayEvent