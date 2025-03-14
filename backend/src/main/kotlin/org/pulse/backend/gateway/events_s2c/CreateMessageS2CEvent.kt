package org.pulse.backend.gateway.events_s2c

import org.pulse.backend.entities.message.Message
import org.pulse.backend.gateway.GatewayEvent

class CreateMessageS2CEvent(
    val channelId: Long,
    val message: Message
) : GatewayEvent