package org.pulse.backend.gateway.events

import org.pulse.backend.gateway.GatewayEvent

class AuthenticationEvent(
    val state: Boolean
) : GatewayEvent