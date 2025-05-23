package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events_s2c.CreateChannelS2CEvent
import org.pulse.backend.gateway.events_s2c.DeleteChannelS2CEvent
import org.pulse.backend.gateway.events_s2c.UpdateChannelMembersS2CEvent
import org.pulse.backend.gateway.events_s2c.UpdateChannelNameS2CEvent
import org.pulse.backend.services.ChannelMemberService
import org.springframework.stereotype.Component

@Component
class ChannelEventDispatcher(
    private val gateway: Gateway,
    private val memberService: ChannelMemberService
) {
    fun dispatchCreateChannelEvent(channel: Channel) =
        memberService.findMembersByChannel(channel).forEach { (_, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                CreateChannelS2CEvent(channel.toResponse())
            )
        }

    fun dispatchDeleteChannelEvent(channel: Channel) =
        memberService.findMembersByChannel(channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                DeleteChannelS2CEvent(channel.id!!)
            )
        }

    fun dispatchUpdateChannelNameEvent(channel: Channel) =
        memberService.findMembersByChannel(channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                UpdateChannelNameS2CEvent(channel.id!!, channel.name!!)
            )
        }

    fun dispatchUpdateChannelMembersEvent(
        channel: Channel,
        user1: User,
        action: UpdateChannelMembersS2CEvent.Action,
        extraUser: User? = null
    ) {
        memberService.findMembersByChannel(channel).forEach { (channel, user2) ->
            gateway.sendToUserSessions(
                user2.id!!,
                UpdateChannelMembersS2CEvent(channel.id!!, user1.toResponse(), action)
            )
        }

        if (extraUser?.id != null &&
            memberService.findMembersByChannel(channel).none { it.user.id == extraUser.id }
        ) {
            gateway.sendToUserSessions(
                extraUser.id,
                UpdateChannelMembersS2CEvent(channel.id!!, user1.toResponse(), action)
            )
        }
    }
}