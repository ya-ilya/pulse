package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.message.Message
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events.CreateMessageEvent
import org.pulse.backend.gateway.events.DeleteMessageEvent
import org.pulse.backend.gateway.events.UpdateMessageEvent
import org.pulse.backend.services.ChannelMemberService
import org.springframework.stereotype.Component

@Component
class MessageEventDispatcher(
    private val gateway: Gateway,
    private val memberService: ChannelMemberService
) {
    fun dispatchCreateMessageEvent(message: Message) = memberService.findMembersByChannel(message.channel).forEach { (channel, user) ->
        gateway.sendToUserSessions(
            user.id!!,
            CreateMessageEvent(channel.id!!)
        )
    }

    fun dispatchDeleteMessageEvent(message: Message) = memberService.findMembersByChannel(message.channel).forEach { (channel, user ) ->
        gateway.sendToUserSessions(
            user.id!!,
            DeleteMessageEvent(channel.id!!)
        )
    }

    fun dispatchUpdateMessageEvent(message: Message) = memberService.findMembersByChannel(message.channel).forEach { (channel, user) ->
        gateway.sendToUserSessions(
            user.id!!,
            UpdateMessageEvent(channel.id!!)
        )
    }
}