package org.pulse.backend.gateway.events_s2c

import org.pulse.backend.gateway.GatewayEvent
import org.pulse.backend.responses.UserResponse

class MemberLeftS2CEvent(
    val channelId: Long,
    val user: UserResponse
) : GatewayEvent