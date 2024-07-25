package org.pulse.backend.message.recited

import org.pulse.backend.message.Message
import org.pulse.backend.user.User
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