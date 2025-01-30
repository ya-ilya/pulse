package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events.TypingS2CEvent
import org.pulse.backend.services.ChannelMemberService
import org.springframework.stereotype.Component
import java.util.*

@Component
class OtherEventDispatcher(
    private val gateway: Gateway,
    private val memberService: ChannelMemberService
) {
    fun dispatchTypingEvent(channel: Channel, userId: UUID) =
        memberService.findMembersByChannel(channel).forEach { (channel, memberUser) ->
            gateway.sendToUserSessions(
                memberUser.id!!,
                TypingS2CEvent(channel.id!!, userId)
            )
        }
}