package org.pulse.backend.gateway.events_c2s

import org.pulse.backend.gateway.GatewayEvent

class TypingC2SEvent(
    val channelId: Long
) : GatewayEvent