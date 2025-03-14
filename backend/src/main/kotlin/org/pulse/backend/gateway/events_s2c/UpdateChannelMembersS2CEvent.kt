package org.pulse.backend.gateway.events_s2c

import org.pulse.backend.gateway.GatewayEvent

class UpdateChannelMembersS2CEvent(
    val channelId: Long
) : GatewayEvent