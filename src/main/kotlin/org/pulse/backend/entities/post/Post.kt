package org.pulse.backend.entities.post

import jakarta.persistence.*
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.chat.Chat
import org.pulse.backend.entities.post.recited.PostRecited
import java.sql.Timestamp

@Entity
class Post(
    val timestamp: Timestamp,
    var content: String,
    @ManyToOne
    val channel: Channel,
    @OneToOne(mappedBy = "post")
    val comments: Chat? = null,
    @OneToMany(mappedBy = "post")
    val recited: List<PostRecited> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)