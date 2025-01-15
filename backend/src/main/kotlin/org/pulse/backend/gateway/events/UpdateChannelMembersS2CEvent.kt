package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdateChannelMembersS2CEvent(
    val channelId: Long
) : GatewayEvent