package org.pulse.backend.services

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.message.MessageRepository
import org.pulse.backend.entities.message.MessageType
import org.pulse.backend.entities.user.User
import org.pulse.backend.responses.ChannelResponse
import org.pulse.backend.responses.MessageResponse
import org.springframework.context.annotation.Lazy
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.sql.Timestamp
import java.time.Instant

@Service
class MessageService(
    private val messageRepository: MessageRepository,
    @Lazy private val channelService: ChannelService,
    private val memberService: ChannelMemberService
) {
    fun getMessageById(messageId: Long): Message {
        return messageRepository
            .findById(messageId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found") }
    }

    fun updateMessage(messageId: Long, content: String): Message {
        return messageRepository.save(
            getMessageById(messageId).apply { this.content = content }
        )
    }

    fun createMessage(content: String, channel: Channel, user: User): Message {
        return messageRepository.save(
            Message(
                MessageType.Message,
                Timestamp.from(Instant.now()),
                content,
                channel,
                user
            )
        )
    }

    fun createPost(content: String, channel: Channel): Message {
        return messageRepository.save(
            Message(
                MessageType.Post,
                Timestamp.from(Instant.now()),
                content,
                channel
            )
        ).also { it.comments = channelService.createCommentsChannel(it) }
    }

    fun createStatus(content: String, channel: Channel): Message {
        return messageRepository.save(
            Message(
                MessageType.Status,
                Timestamp.from(Instant.now()),
                content,
                channel
            )
        )
    }

    fun deleteMessage(message: Message) {
        message.channel.messages.removeIf { it.id == message.id }
        messageRepository.deleteById(message.id!!)
        messageRepository.flush()
    }

    fun getMessageByIdForUser(user: User, messageId: Long): MessageResponse {
        val message = getMessageById(messageId)
        if (message.type == MessageType.Message && !message.channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found")
        }
        return message.toResponse()
    }

    fun getCommentsChannel(messageId: Long): ChannelResponse {
        val message = getMessageById(messageId)
        return message.comments!!.toResponse()
    }

    fun joinCommentsChannel(user: User, messageId: Long): ChannelResponse {
        val message = getMessageById(messageId)
        if (!message.channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        if (message.comments!!.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }
        memberService.createMember(message.comments!!, user)
        return channelService.getChannelById(message.comments!!.id!!).toResponse()
    }

    fun updateMessageForUser(user: User, messageId: Long, content: String): Message {
        val message = getMessageById(messageId)
        when (message.type) {
            MessageType.Message -> {
                if (message.user?.id != user.id) {
                    throw ResponseStatusException(HttpStatus.FORBIDDEN)
                }
            }
            MessageType.Post -> {
                if (message.channel.admin?.id != user.id) {
                    throw ResponseStatusException(HttpStatus.FORBIDDEN)
                }
            }
            MessageType.Status -> throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return updateMessage(messageId, content)
    }

    fun deleteMessageForUser(user: User, messageId: Long): Message {
        val message = getMessageById(messageId)
        val isOwner = message.user?.id == user.id
        val isAdmin = message.channel.admin?.id == user.id
        if (!isOwner && !isAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        deleteMessage(message)
        return message
    }
}