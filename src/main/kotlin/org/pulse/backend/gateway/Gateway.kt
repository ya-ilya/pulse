package org.pulse.backend.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import org.pulse.backend.gateway.events.AuthenticationEvent
import org.pulse.backend.services.AuthenticationService
import org.pulse.backend.services.UserService
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.*

@Component
class Gateway(
    private val objectMapper: ObjectMapper,
    private val userService: UserService,
    private val authenticationService: AuthenticationService
) : TextWebSocketHandler() {
    private val activeSessions = Collections.synchronizedSet<GatewaySession>(mutableSetOf())

    override fun afterConnectionEstablished(session: WebSocketSession) {
        activeSessions.add(GatewaySession(session, objectMapper, userService))
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        val email = try {
            authenticationService.extractEmail(message.payload)
        } catch (ex: Exception) {
            ""
        }

        var state = false

        userService.findUserByEmail(email).ifPresent { user ->
            if (authenticationService.isAccessTokenValid(message.payload, user)) {
                this[session]?.userId = user.id
                state = true
            }
        }

        this[session]?.sendEvent(AuthenticationEvent(state))

        if (!state) {
            session.close()
        }
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        activeSessions.removeIf { it.session == session }
    }

    operator fun get(userId: UUID): List<GatewaySession>? {
        return activeSessions.filter { it.userId == userId }
    }

    operator fun get(session: WebSocketSession): GatewaySession? {
        return activeSessions.firstOrNull { it.session == session }
    }

    fun isOnline(userId: UUID): Boolean {
        return get(userId)?.isNotEmpty() == true
    }

    fun sendToUserSessions(userId: UUID, event: GatewayEvent) {
        get(userId)?.forEach {
            try {
                it.sendEvent(event)
            } catch (ex: Exception) {
                it.session.close()
            }
        }
    }
}