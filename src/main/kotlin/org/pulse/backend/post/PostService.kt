package org.pulse.backend.post

import org.pulse.backend.channel.Channel
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.Instant

@Service
class PostService(private val postRepository: PostRepository) {
    fun createPost(content: String, channel: Channel): Post {
        return postRepository.save(
            Post(
                Timestamp.from(Instant.now()),
                content,
                channel
            )
        )
    }
}