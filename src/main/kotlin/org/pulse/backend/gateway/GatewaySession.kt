package org.pulse.backend.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import org.pulse.backend.entities.user.User
import org.pulse.backend.services.UserService
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import java.util.UUID

class GatewaySession(
    val session: WebSocketSession,
    private val objectMapper: ObjectMapper,
    private val userService: UserService
) {
    var userId: UUID? = null

    val user: User get() = userService.getUserById(userId!!)

    fun sendEvent(event: GatewayEvent) {
        session.sendMessage(TextMessage(objectMapper.writeValueAsString(event)))
    }
}