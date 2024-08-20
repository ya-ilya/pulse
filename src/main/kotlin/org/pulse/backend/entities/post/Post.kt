package org.pulse.backend.entities.post

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.pulse.backend.entities.channel.Channel
import java.sql.Timestamp

@Entity
class Post(
    val timestamp: Timestamp,
    var content: String,
    @ManyToOne
    val channel: Channel,
    @OneToOne
    @JsonIgnore
    var comments: Channel? = null,
    @Id
    @GeneratedValue
    val id: Long? = null
)