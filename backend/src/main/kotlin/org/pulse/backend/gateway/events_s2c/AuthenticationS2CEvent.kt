package org.pulse.backend.gateway.events_s2c

import org.pulse.backend.gateway.GatewayEvent

class AuthenticationS2CEvent(
    val state: Boolean
) : GatewayEvent