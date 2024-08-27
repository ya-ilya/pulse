package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdateChannelNameS2CEvent(
    val channelId: Long,
    val name: String
) : GatewayEvent