package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class DeleteChannelEvent(
    val channelId: Long
) : GatewayEvent