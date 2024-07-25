package org.pulse.backend.post.recited

import org.pulse.backend.post.Post
import org.pulse.backend.user.User
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