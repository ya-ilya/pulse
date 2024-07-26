package org.pulse.backend.services

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.channel.ChannelRepository
import org.pulse.backend.entities.user.User
import org.springframework.stereotype.Service

@Service
class ChannelService(
    private val channelRepository: ChannelRepository,
    private val memberService: ChannelMemberService
) {
    fun getChannelById(channelId: Long): Channel {
        return channelRepository
            .findById(channelId)
            .get()
    }

    fun updateChannel(channelId: Long, name: String): Channel {
        return channelRepository.save(
            getChannelById(channelId).apply { this.name = name }
        )
    }

    fun createChannel(name: String, user: User): Channel {
        val channel = channelRepository.save(Channel(name, user))

        memberService.createMember(channel, user)

        return channelRepository.findById(channel.id!!).get()
    }

    fun deleteChannel(channelId: Long) {
        channelRepository.deleteById(channelId)
    }
}