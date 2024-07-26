package org.pulse.backend.entities.message

import jakarta.persistence.*
import org.pulse.backend.entities.chat.Chat
import org.pulse.backend.entities.message.recited.MessageRecited
import org.pulse.backend.entities.user.User
import java.sql.Timestamp

@Entity
class Message(
    val timestamp: Timestamp,
    var content: String,
    @ManyToOne
    val chat: Chat,
    @ManyToOne
    val user: User,
    @OneToMany(mappedBy = "message")
    val recited: List<MessageRecited> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)