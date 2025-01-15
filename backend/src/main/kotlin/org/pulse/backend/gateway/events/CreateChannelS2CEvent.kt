package org.pulse.backend.gateway.events

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.gateway.GatewayEvent

class CreateChannelS2CEvent(
    val channel: Channel
) : GatewayEvent