package org.pulse.backend.post

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import org.pulse.backend.channel.Channel
import org.pulse.backend.post.recited.PostRecited
import java.sql.Timestamp

@Entity
class Post(
    val timestamp: Timestamp,
    val content: String,
    @ManyToOne
    val channel: Channel,
    @OneToMany(mappedBy = "post")
    val recited: List<PostRecited> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)