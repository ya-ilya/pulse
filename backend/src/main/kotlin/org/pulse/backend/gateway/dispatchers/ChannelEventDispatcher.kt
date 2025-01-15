package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events.CreateChannelS2CEvent
import org.pulse.backend.gateway.events.DeleteChannelS2CEvent
import org.pulse.backend.gateway.events.UpdateChannelMembersS2CEvent
import org.pulse.backend.gateway.events.UpdateChannelNameS2CEvent
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
                CreateChannelS2CEvent(channel)
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

    fun dispatchUpdateChannelMembersEvent(channel: Channel) =
        memberService.findMembersByChannel(channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                UpdateChannelMembersS2CEvent(channel.id!!)
            )
        }
}