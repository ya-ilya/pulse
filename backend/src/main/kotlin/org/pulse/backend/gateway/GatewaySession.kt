package org.pulse.backend.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import java.util.*
import java.util.concurrent.CompletableFuture

class GatewaySession(
    val session: WebSocketSession,
    private val objectMapper: ObjectMapper
) {
    var userId: UUID? = null

    fun sendEvent(event: GatewayEvent) {
        val message = TextMessage(objectMapper.writeValueAsString(event))
        CompletableFuture.runAsync {
            session.sendMessage(message)
        }
    }

    fun close() {
        session.close()
    }
}