package org.pulse.backend.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.validation.Validator
import org.pulse.backend.gateway.events_c2s.AuthenticationC2SEvent
import org.pulse.backend.gateway.events_c2s.TypingC2SEvent
import org.pulse.backend.gateway.events_s2c.AuthenticationS2CEvent
import org.pulse.backend.gateway.events_s2c.ErrorS2CEvent
import org.pulse.backend.gateway.events_s2c.TypingS2CEvent
import org.pulse.backend.services.AuthenticationService
import org.pulse.backend.services.ChannelMemberService
import org.pulse.backend.services.ChannelService
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
    private val channelService: ChannelService,
    private val authenticationService: AuthenticationService,
    private val memberService: ChannelMemberService,
    private val validator: Validator
) : TextWebSocketHandler() {
    private val activeSessions = Collections.synchronizedSet<GatewaySession>(mutableSetOf())

    init {
        objectMapper.registerSubtypes(GatewayEvent::class.java)
    }

    override fun afterConnectionEstablished(session: WebSocketSession) {
        activeSessions.add(GatewaySession(session, objectMapper))
    }

    fun handleAuthenticationEvent(session: WebSocketSession, event: AuthenticationC2SEvent) {
        val email = try {
            authenticationService.extractEmail(event.token)
        } catch (ex: Exception) {
            ""
        }

        var authenticationState = false

        userService.findUserByEmail(email).ifPresent { user ->
            if (authenticationService.isAccessTokenValid(event.token, user)) {
                this[session]?.userId = user.id
                authenticationState = true
            }
        }

        this[session]?.sendEvent(AuthenticationS2CEvent(authenticationState))

        if (!authenticationState) {
            session.close()
        }
    }

    fun handleTypingEvent(session: WebSocketSession, event: TypingC2SEvent) {
        memberService.findMembersByChannel(channelService.getChannelById(event.channelId))
            .forEach { (channel, memberUser) ->
                val userId = this[session]!!.userId!!
                sendToUserSessions(
                    memberUser.id!!,
                    TypingS2CEvent(
                        channel.id!!,
                        userId,
                        userService.getUserById(userId).username
                    )
                )
            }
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        try {
            val event = objectMapper.readValue(message.payload, GatewayEvent::class.java)

            if (validator.validate(event).isNotEmpty()) {
                this[session]!!.sendEvent(
                    ErrorS2CEvent(
                        "Invalid message"
                    )
                )
            }

            when (event) {
                is AuthenticationC2SEvent -> handleAuthenticationEvent(session, event)
                is TypingC2SEvent -> handleTypingEvent(session, event)
            }
        } catch (ex: Exception) {
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