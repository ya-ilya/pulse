package org.pulse.backend.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import java.util.*

class GatewaySession(
    val session: WebSocketSession,
    private val objectMapper: ObjectMapper
) {
    var userId: UUID? = null

    fun sendEvent(event: GatewayEvent) {
        session.sendMessage(TextMessage(objectMapper.writeValueAsString(event)))
    }
}