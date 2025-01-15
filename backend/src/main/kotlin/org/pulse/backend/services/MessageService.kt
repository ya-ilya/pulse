package org.pulse.backend.services

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.message.MessageRepository
import org.pulse.backend.entities.message.MessageType
import org.pulse.backend.entities.user.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.sql.Timestamp
import java.time.Instant

@Service
class MessageService(
    private val messageRepository: MessageRepository,
    private val channelService: ChannelService
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

    fun deleteMessage(messageId: Long) {
        messageRepository.deleteById(messageId)
    }
}