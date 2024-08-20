package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.post.Post
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events.CreatePostEvent
import org.pulse.backend.gateway.events.DeletePostEvent
import org.pulse.backend.gateway.events.UpdatePostContentEvent
import org.pulse.backend.services.ChannelMemberService
import org.springframework.stereotype.Component

@Component
class PostEventDispatcher(
    private val gateway: Gateway,
    private val memberService: ChannelMemberService
) {
    fun dispatchCreatePostEvent(post: Post) =
        memberService.findMembersByChannel(post.channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                CreatePostEvent(channel.id!!, post.id!!)
            )
        }

    fun dispatchDeletePostEvent(post: Post) =
        memberService.findMembersByChannel(post.channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                DeletePostEvent(channel.id!!, post.id!!)
            )
        }

    fun dispatchUpdatePostContentEvent(post: Post) =
        memberService.findMembersByChannel(post.channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                UpdatePostContentEvent(channel.id!!, post.id!!, post.content)
            )
        }
}