package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdateChannelNameEvent(
    val channelId: Long,
    val name: String
) : GatewayEvent