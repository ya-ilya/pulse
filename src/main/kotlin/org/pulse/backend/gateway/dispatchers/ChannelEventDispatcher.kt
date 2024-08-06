package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.post.Post
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events.*
import org.pulse.backend.services.ChannelMemberService
import org.springframework.stereotype.Component

@Component
class ChannelEventDispatcher(
    private val gateway: Gateway,
    private val memberService: ChannelMemberService
) {
    fun dispatchCreateChannelEvent(channel: Channel) = memberService.findMembersByChannel(channel).forEach { (_, user) ->
        gateway.sentToUserSessions(
            user.id!!,
            CreateChannelEvent(channel.id!!)
        )
    }

    fun dispatchCreateMessageEvent(message: Message) = memberService.findMembersByChannel(message.channel).forEach { (channel, user) ->
        gateway.sentToUserSessions(
            user.id!!,
            CreateMessageEvent(channel.id!!)
        )
    }

    fun dispatchCreatePostEvent(post: Post) = memberService.findMembersByChannel(post.channel).forEach { (channel, user) ->
        gateway.sentToUserSessions(
            user.id!!,
            CreatePostEvent(channel.id!!)
        )
    }

    fun dispatchDeleteChannelEvent(channel: Channel) = memberService.findMembersByChannel(channel).forEach { (channel, user) ->
        gateway.sentToUserSessions(
            user.id!!,
            DeleteChannelEvent(channel.id!!)
        )
    }

    fun dispatchUpdateChannelEvent(channel: Channel) = memberService.findMembersByChannel(channel).forEach { (channel, user) ->
        gateway.sentToUserSessions(
            user.id!!,
            UpdateChannelEvent(channel.id!!)
        )
    }

    fun dispatchUpdateChannelMembersEvent(channel: Channel) = memberService.findMembersByChannel(channel).forEach { (channel, user) ->
        gateway.sentToUserSessions(
            user.id!!,
            UpdateChannelMembersEvent(channel.id!!)
        )
    }
}