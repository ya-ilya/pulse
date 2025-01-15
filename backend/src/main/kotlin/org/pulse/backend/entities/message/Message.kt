package org.pulse.backend.entities.message

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.user.User
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
    @JsonIgnore
    var comments: Channel? = null,
    @Id
    @GeneratedValue
    val id: Long? = null
)