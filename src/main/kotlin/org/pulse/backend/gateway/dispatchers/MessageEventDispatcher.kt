package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.message.Message
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events.CreateMessageEvent
import org.pulse.backend.gateway.events.DeleteMessageEvent
import org.pulse.backend.gateway.events.UpdateMessageContentEvent
import org.pulse.backend.services.ChannelMemberService
import org.springframework.stereotype.Component

@Component
class MessageEventDispatcher(
    private val gateway: Gateway,
    private val memberService: ChannelMemberService
) {
    fun dispatchCreateMessageEvent(message: Message) =
        memberService.findMembersByChannel(message.channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                CreateMessageEvent(channel.id!!, message.id!!)
            )
        }

    fun dispatchDeleteMessageEvent(message: Message) =
        memberService.findMembersByChannel(message.channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                DeleteMessageEvent(channel.id!!, message.id!!)
            )
        }

    fun dispatchUpdateMessageContentEvent(message: Message) =
        memberService.findMembersByChannel(message.channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                UpdateMessageContentEvent(channel.id!!, message.id!!, message.content)
            )
        }
}