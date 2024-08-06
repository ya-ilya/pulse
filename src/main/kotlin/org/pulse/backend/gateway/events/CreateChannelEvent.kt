package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class CreateChannelEvent(
    val channelId: Long
) : GatewayEvent