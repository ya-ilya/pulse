package org.pulse.backend.services

import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.message.recited.MessageRecited
import org.pulse.backend.entities.message.recited.MessageRecitedRepository
import org.pulse.backend.entities.user.User
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.Instant

@Service
class MessageRecitedService(private val recitedRepository: MessageRecitedRepository) {
    fun createRecited(message: Message, user: User): MessageRecited {
        return recitedRepository.save(
            MessageRecited(
                Timestamp.from(Instant.now()),
                message,
                user
            )
        )
    }
}