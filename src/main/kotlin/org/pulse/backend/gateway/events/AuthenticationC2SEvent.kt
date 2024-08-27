package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class AuthenticationC2SEvent(
    val token: String
) : GatewayEvent