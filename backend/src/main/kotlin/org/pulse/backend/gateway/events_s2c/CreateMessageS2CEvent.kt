package org.pulse.backend.gateway.events_s2c

import org.pulse.backend.gateway.GatewayEvent
import org.pulse.backend.responses.MessageResponse

class CreateMessageS2CEvent(
    val channelId: Long,
    val message: MessageResponse
) : GatewayEvent