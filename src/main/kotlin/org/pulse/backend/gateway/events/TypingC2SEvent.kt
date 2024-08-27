package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class TypingC2SEvent(
    val channelId: Long
) : GatewayEvent