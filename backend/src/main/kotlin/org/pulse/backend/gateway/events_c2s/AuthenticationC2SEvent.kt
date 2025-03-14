package org.pulse.backend.gateway.events_c2s

import org.pulse.backend.gateway.GatewayEvent

class AuthenticationC2SEvent(
    val token: String
) : GatewayEvent