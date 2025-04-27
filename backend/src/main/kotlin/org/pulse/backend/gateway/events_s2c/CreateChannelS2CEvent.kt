package org.pulse.backend.gateway.events_s2c

import org.pulse.backend.gateway.GatewayEvent
import org.pulse.backend.responses.ChannelResponse

class CreateChannelS2CEvent(
    val channel: ChannelResponse
) : GatewayEvent