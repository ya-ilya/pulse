package org.pulse.backend.entities.message

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.user.User
import java.sql.Timestamp

@Entity
class Message(
    val timestamp: Timestamp,
    var content: String,
    @ManyToOne
    val channel: Channel,
    @ManyToOne
    val user: User,
    @Id
    @GeneratedValue
    val id: Long? = null
)