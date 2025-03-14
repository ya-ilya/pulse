package org.pulse.backend.gateway

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import org.pulse.backend.gateway.events_c2s.AuthenticationC2SEvent
import org.pulse.backend.gateway.events_c2s.TypingC2SEvent

@JsonTypeInfo(use = JsonTypeInfo.Id.SIMPLE_NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes(
    JsonSubTypes.Type(AuthenticationC2SEvent::class),
    JsonSubTypes.Type(TypingC2SEvent::class)
)
interface GatewayEvent