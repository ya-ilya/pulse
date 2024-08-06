package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class DeleteMessageEvent(
    val channelId: Long
) : GatewayEvent