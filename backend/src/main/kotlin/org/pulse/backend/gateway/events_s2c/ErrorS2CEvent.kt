package org.pulse.backend.gateway.events_s2c

import org.pulse.backend.gateway.GatewayEvent

class ErrorS2CEvent(
    val error: String
) : GatewayEvent