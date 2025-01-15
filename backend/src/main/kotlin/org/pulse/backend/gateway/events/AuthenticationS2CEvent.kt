package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class AuthenticationS2CEvent(
    val state: Boolean
) : GatewayEvent