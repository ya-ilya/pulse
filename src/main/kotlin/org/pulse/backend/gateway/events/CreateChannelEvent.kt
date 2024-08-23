package org.pulse.backend.gateway.events

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.gateway.GatewayEvent

class CreateChannelEvent(
    val channel: Channel
) : GatewayEvent