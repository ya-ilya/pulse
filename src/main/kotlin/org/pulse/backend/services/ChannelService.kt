package org.pulse.backend.services

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.channel.ChannelRepository
import org.pulse.backend.entities.channel.ChannelType
import org.pulse.backend.entities.post.Post
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
        val channel = channelRepository.save(Channel(ChannelType.Channel, name, user))

        memberService.createMember(channel, user)

        return channelRepository.findById(channel.id!!).get()
    }

    fun createPrivateChatChannel(user: User, other: User): Channel {
        val channel = channelRepository.save(Channel(ChannelType.PrivateChat))

        memberService.createMember(channel, user)
        memberService.createMember(channel, other)

        return channelRepository.findById(channel.id!!).get()
    }

    fun createGroupChatChannel(name: String, user: User, other: List<User>): Channel {
        val channel = channelRepository.save(Channel(ChannelType.GroupChat, name, admin = user))

        memberService.createMember(channel, user)
        other.forEach { memberService.createMember(channel, it) }

        return channelRepository.findById(channel.id!!).get()
    }

    fun createCommentsChannel(post: Post): Channel {
        return channelRepository.save(Channel(ChannelType.CommentsChat, admin = post.channel.admin))
    }

    fun deleteChannel(channelId: Long) {
        channelRepository.deleteById(channelId)
    }
}