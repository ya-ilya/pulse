package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.message.Message
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events.CreateMessageS2CEvent
import org.pulse.backend.gateway.events.DeleteMessageS2CEvent
import org.pulse.backend.gateway.events.UpdateMessageContentS2CEvent
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
                CreateMessageS2CEvent(channel.id!!, message)
            )
        }

    fun dispatchDeleteMessageEvent(message: Message) =
        memberService.findMembersByChannel(message.channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                DeleteMessageS2CEvent(channel.id!!, message.id!!)
            )
        }

    fun dispatchUpdateMessageContentEvent(message: Message) =
        memberService.findMembersByChannel(message.channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                UpdateMessageContentS2CEvent(channel.id!!, message.id!!, message.content)
            )
        }
}