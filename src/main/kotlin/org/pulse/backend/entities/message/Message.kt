package org.pulse.backend.entities.message

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.message.recited.MessageRecited
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
    @OneToMany(mappedBy = "message")
    @JsonIgnore
    val recited: MutableList<MessageRecited> = mutableListOf(),
    @Id
    @GeneratedValue
    val id: Long? = null
)