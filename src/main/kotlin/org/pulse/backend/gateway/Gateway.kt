package org.pulse.backend.gateway

import com.fasterxml.jackson.databind.ObjectMapper
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.events.AuthenticationC2SEvent
import org.pulse.backend.gateway.events.AuthenticationS2CEvent
import org.pulse.backend.gateway.events.TypingC2SEvent
import org.pulse.backend.gateway.events.TypingS2CEvent
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
    private val memberService: ChannelMemberService,
    private val channelService: ChannelService,
    private val authenticationService: AuthenticationService
) : TextWebSocketHandler() {
    private val activeSessions = Collections.synchronizedSet<GatewaySession>(mutableSetOf())

    init {
        objectMapper.registerSubtypes(GatewayEvent::class.java)
    }

    override fun afterConnectionEstablished(session: WebSocketSession) {
        activeSessions.add(GatewaySession(session, objectMapper, userService))
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        try {
            when (val event = objectMapper.readValue(message.payload, GatewayEvent::class.java)) {
                is AuthenticationC2SEvent -> {
                    val email = try {
                        authenticationService.extractEmail(event.token)
                    } catch (ex: Exception) {
                        ""
                    }

                    var state = false

                    userService.findUserByEmail(email).ifPresent { user ->
                        if (authenticationService.isAccessTokenValid(event.token, user)) {
                            this[session]?.userId = user.id
                            state = true
                        }
                    }

                    this[session]?.sendEvent(AuthenticationS2CEvent(state))

                    if (!state) {
                        session.close()
                    }
                }

                is TypingC2SEvent -> {
                    dispatchTypingEvent(
                        channelService.getChannelById(event.channelId),
                        this[session]!!.user
                    )
                }
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

    fun dispatchTypingEvent(channel: Channel, user: User) =
        memberService.findMembersByChannel(channel).forEach { (channel, memberUser) ->
            sendToUserSessions(
                memberUser.id!!,
                TypingS2CEvent(channel.id!!, user.id!!)
            )
        }
}