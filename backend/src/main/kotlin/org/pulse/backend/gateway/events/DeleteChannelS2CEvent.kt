package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class DeleteChannelS2CEvent(
    val channelId: Long
) : GatewayEvent