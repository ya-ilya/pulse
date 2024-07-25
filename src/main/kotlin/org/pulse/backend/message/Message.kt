package org.pulse.backend.message

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.chat.Chat
import org.pulse.backend.user.User
import java.sql.Timestamp

@Entity
class Message(
    val timestamp: Timestamp,
    val content: String,
    @ManyToOne
    val chat: Chat,
    @ManyToOne
    val user: User,
    @Id
    @GeneratedValue
    val id: Long? = null
)