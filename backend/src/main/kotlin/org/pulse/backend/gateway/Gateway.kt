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
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.*
import java.util.concurrent.ConcurrentHashMap

@Component
class Gateway(
    private val objectMapper: ObjectMapper,
    private val userService: UserService,
    private val channelService: ChannelService,
    private val authenticationService: AuthenticationService,
    private val memberService: ChannelMemberService,
    private val validator: Validator
) : TextWebSocketHandler() {
    private val activeSessions = ConcurrentHashMap.newKeySet<GatewaySession>()
    private val logger = LoggerFactory.getLogger(Gateway::class.java)

    init {
        objectMapper.registerSubtypes(GatewayEvent::class.java)
    }

    fun handleAuthenticationEvent(gatewaySession: GatewaySession, event: AuthenticationC2SEvent) {
        val email = try {
            authenticationService.extractEmail(event.token)
        } catch (ex: Exception) {
            ""
        }

        var authenticationState = false

        userService.findUserByEmail(email).ifPresent { user ->
            if (authenticationService.isAccessTokenValid(event.token, user)) {
                gatewaySession.userId = user.id
                authenticationState = true
            }
        }

        gatewaySession.sendEvent(AuthenticationS2CEvent(authenticationState))

        if (!authenticationState) {
            gatewaySession.close()
        }
    }

    fun handleTypingEvent(gatewaySession: GatewaySession, event: TypingC2SEvent) {
        val channel = channelService.getChannelById(event.channelId)
        val user = userService.getUserById(gatewaySession.userId!!)

        if (user.channels.none { it.channel.id == channel.id }) {
            return
        }

        memberService.findMembersByChannel(channel)
            .forEach { (channel, memberUser) ->
                sendToUserSessions(
                    memberUser.id!!,
                    TypingS2CEvent(
                        channel.id!!,
                        user.id!!,
                        user.username
                    )
                )
            }
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        try {
            val gatewaySession = this[session] ?: return
            val event = objectMapper.readValue(message.payload, GatewayEvent::class.java)

            if (validator.validate(event).isNotEmpty()) {
                gatewaySession.sendEvent(
                    ErrorS2CEvent(
                        "Invalid message"
                    )
                )
                return
            }

            when (event) {
                is AuthenticationC2SEvent -> handleAuthenticationEvent(gatewaySession, event)
                else -> {
                    if (gatewaySession.userId == null) {
                        gatewaySession.sendEvent(
                            ErrorS2CEvent(
                                "You must be authorized"
                            )
                        )
                        return
                    }

                    when (event) {
                        is TypingC2SEvent -> handleTypingEvent(gatewaySession, event)
                    }
                }
            }
        } catch (ex: Exception) {
            logger.error("WebSocket error", ex)
            session.close()
        }
    }

    override fun afterConnectionEstablished(session: WebSocketSession) {
        activeSessions.add(GatewaySession(session, objectMapper))
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