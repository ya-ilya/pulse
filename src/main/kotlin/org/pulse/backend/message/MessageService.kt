package org.pulse.backend.message

import org.pulse.backend.chat.Chat
import org.pulse.backend.user.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.sql.Timestamp
import java.time.Instant

@Service
class MessageService(private val messageRepository: MessageRepository) {
    fun createMessage(content: String, chat: Chat, user: User): Message {
        if (!chat.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found")
        }

        return messageRepository.save(
            Message(
                Timestamp.from(Instant.now()),
                content,
                chat,
                user
            )
        )
    }
}