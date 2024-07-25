package org.pulse.backend.post.recited

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.post.Post
import org.pulse.backend.user.User
import java.sql.Timestamp

@Entity
class PostRecited(
    val timestamp: Timestamp,
    @ManyToOne
    val post: Post,
    @ManyToOne
    val user: User,
    @Id
    @GeneratedValue
    val id: Long? = null
)