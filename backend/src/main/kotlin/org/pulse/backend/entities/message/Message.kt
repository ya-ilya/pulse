package org.pulse.backend.entities.message

import jakarta.persistence.*
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.user.User
import org.pulse.backend.responses.MessageResponse
import java.sql.Timestamp

@Entity
class Message(
    val type: MessageType,
    val timestamp: Timestamp,
    @Lob
    var content: String,
    @ManyToOne
    val channel: Channel,
    @ManyToOne
    val user: User? = null,
    @OneToOne
    var comments: Channel? = null,
    @Id
    @GeneratedValue
    val id: Long? = null
) {
    fun toResponse(): MessageResponse {
        return MessageResponse(
            type,
            timestamp,
            content,
            user?.toResponse(),
            id!!
        )
    }
}