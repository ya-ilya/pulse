package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class UpdateChannelMembersEvent(
    val channelId: Long
) : GatewayEvent