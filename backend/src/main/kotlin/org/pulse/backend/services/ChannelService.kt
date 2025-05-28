package org.pulse.backend.services

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.channel.ChannelRepository
import org.pulse.backend.entities.channel.ChannelType
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.user.User
import org.pulse.backend.responses.ChannelResponse
import org.pulse.backend.responses.MessageResponse
import org.pulse.backend.responses.UserResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class ChannelService(
    private val channelRepository: ChannelRepository,
    private val memberService: ChannelMemberService,
    private val messageService: MessageService
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

    fun createCommentsChannel(message: Message): Channel {
        return channelRepository.save(Channel(ChannelType.CommentsChat, post = message, admin = message.channel.admin))
    }

    fun deleteChannel(channel: Channel) {
        channelRepository.deleteById(channel.id!!)
        channelRepository.flush()
    }

    fun getUserChannels(user: User): List<ChannelResponse> {
        return user.channels.map { it.channel.toResponse() }
    }

    fun getChannelByIdForUser(user: User, channelId: Long): ChannelResponse {
        val channel = getChannelById(channelId)
        if (channel.type != ChannelType.Channel && !channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        return channel.toResponse()
    }

    fun getChannelMembersForUser(user: User, channelId: Long): List<UserResponse> {
        val channel = getChannelById(channelId)
        if (channel.type != ChannelType.Channel && !channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        if (channel.type == ChannelType.GroupChat && channel.admin?.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return channel.members.map { it.user.toResponse() }
    }

    fun getChannelMessagesForUser(user: User, channelId: Long): List<MessageResponse> {
        val channel = getChannelById(channelId)
        if (channel.type != ChannelType.Channel && !channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        return channel.messages.map { it.toResponse() }
    }

    fun createMessageInChannel(user: User, channelId: Long, content: String): Message {
        val channel = getChannelById(channelId)
        if (!channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        if (channel.type == ChannelType.Channel && channel.admin?.id != user.id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }
        return if (channel.type == ChannelType.Channel) {
            messageService.createPost(content, channel)
        } else {
            messageService.createMessage(content, channel, user)
        }
    }

    fun createPrivateChatChannelForUser(user: User, other: User): Channel {
        if (user.channels.any { it.channel.type == ChannelType.PrivateChat && it.channel.members.any { m -> m.user.id == other.id } }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }
        return createPrivateChatChannel(user, other)
    }

    fun updateChannelForUser(user: User, channelId: Long, name: String): Channel {
        val channel = getChannelById(channelId)
        if (channel.type != ChannelType.GroupChat && channel.type != ChannelType.Channel) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        if (channel.admin!!.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return updateChannel(channelId, name)
    }

    fun deleteChannelForUser(user: User, channelId: Long): Channel {
        val channel = getChannelById(channelId)
        if (!channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        if (channel.type != ChannelType.PrivateChat && channel.admin?.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        deleteChannel(channel)
        return channel
    }

    fun joinChannel(user: User, channelId: Long): Channel {
        val channel = getChannelById(channelId)
        if (channel.type != ChannelType.Channel) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
        if (channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }
        memberService.createMember(channel, user)
        return getChannelById(channelId)
    }

    fun leaveChannel(user: User, channelId: Long): Triple<Channel, User, Message?> {
        val channel = getChannelById(channelId)
        when {
            channel.members.none { it.user.id == user.id } ->
                throw ResponseStatusException(HttpStatus.NOT_FOUND)

            channel.admin?.id == user.id ->
                throw ResponseStatusException(HttpStatus.FORBIDDEN)

            channel.type == ChannelType.PrivateChat ->
                throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }
        val member = channel.members.single { it.user.id == user.id }
        memberService.deleteMember(member)
        var statusMessage: Message? = null
        if (channel.type == ChannelType.GroupChat) {
            statusMessage = messageService.createStatus("@${user.username} left the group", channel)
        }
        return Triple(channel, user, statusMessage)
    }
}