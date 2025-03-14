package org.pulse.backend.gateway.events_s2c

import org.pulse.backend.gateway.GatewayEvent
import java.util.*

class TypingS2CEvent(
    val channelId: Long,
    val userId: UUID,
    val username: String
) : GatewayEvent