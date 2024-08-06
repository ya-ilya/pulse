package org.pulse.backend.services

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.post.PostRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.sql.Timestamp
import java.time.Instant

@Service
class PostService(
    private val postRepository: PostRepository,
    private val channelService: ChannelService
) {
    fun getPostById(postId: Long): Post {
        return postRepository
            .findById(postId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found") }
    }

    fun updatePost(postId: Long, content: String): Post {
        return postRepository.save(
            getPostById(postId).apply { this.content = content }
        )
    }

    fun createPost(content: String, channel: Channel): Post {
        return postRepository.save(
            Post(
                Timestamp.from(Instant.now()),
                content,
                channel
            )
        ).apply { this.comments = channelService.createCommentsChannel(this) }
    }

    fun deletePost(postId: Long) {
        postRepository.deleteById(postId)
    }
}