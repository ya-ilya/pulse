package org.pulse.backend.services

import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.post.recited.PostRecited
import org.pulse.backend.entities.post.recited.PostRecitedRepository
import org.pulse.backend.entities.user.User
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.Instant

@Service
class PostRecitedService(private val recitedRepository: PostRecitedRepository) {
    fun createRecited(post: Post, user: User): PostRecited {
        return recitedRepository.save(
            PostRecited(
                Timestamp.from(Instant.now()),
                post,
                user
            )
        )
    }
}