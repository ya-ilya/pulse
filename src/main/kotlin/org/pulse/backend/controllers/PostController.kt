package org.pulse.backend.controllers

import org.pulse.backend.entities.post.Post
import org.pulse.backend.requests.UpdatePostRequest
import org.pulse.backend.services.PostService
import org.pulse.backend.entities.user.User
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/posts")
class PostController(private val postService: PostService) {
    @GetMapping("/{postId}")
    fun getPostById(@PathVariable postId: Long): Post {
        return postService.getPostById(postId)
    }

    @PatchMapping("/{postId}")
    fun updatePost(
        @AuthenticationPrincipal user: User,
        @PathVariable postId: Long,
        @RequestBody request: UpdatePostRequest
    ): Post {
        val post = postService.getPostById(postId)

        if (post.channel.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return postService.updatePost(postId, request.content)
    }

    @DeleteMapping("/{postId}")
    fun deletePost(@AuthenticationPrincipal user: User, @PathVariable postId: Long) {
        val post = postService.getPostById(postId)

        if (post.channel.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        postService.deletePost(postId)
    }
}