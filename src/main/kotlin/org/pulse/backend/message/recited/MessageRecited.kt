package org.pulse.backend.message.recited

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.message.Message
import org.pulse.backend.user.User
import java.sql.Timestamp

@Entity
class MessageRecited(
    val timestamp: Timestamp,
    @ManyToOne
    val message: Message,
    @ManyToOne
    val user: User,
    @Id
    @GeneratedValue
    val id: Long? = null
)