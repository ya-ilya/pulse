package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdateChannelEvent(
    val channelId: Long
) : GatewayEvent