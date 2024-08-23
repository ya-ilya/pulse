package org.pulse.backend.gateway.dispatchers

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.gateway.Gateway
import org.pulse.backend.gateway.events.CreateChannelEvent
import org.pulse.backend.gateway.events.DeleteChannelEvent
import org.pulse.backend.gateway.events.UpdateChannelMembersEvent
import org.pulse.backend.gateway.events.UpdateChannelNameEvent
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
                CreateChannelEvent(channel)
            )
        }

    fun dispatchDeleteChannelEvent(channel: Channel) =
        memberService.findMembersByChannel(channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                DeleteChannelEvent(channel.id!!)
            )
        }

    fun dispatchUpdateChannelNameEvent(channel: Channel) =
        memberService.findMembersByChannel(channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                UpdateChannelNameEvent(channel.id!!, channel.name!!)
            )
        }

    fun dispatchUpdateChannelMembersEvent(channel: Channel) =
        memberService.findMembersByChannel(channel).forEach { (channel, user) ->
            gateway.sendToUserSessions(
                user.id!!,
                UpdateChannelMembersEvent(channel.id!!)
            )
        }
}