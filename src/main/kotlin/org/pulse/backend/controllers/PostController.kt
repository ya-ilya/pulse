package org.pulse.backend.controllers

import org.pulse.backend.entities.chat.Chat
import org.pulse.backend.entities.post.Post
import org.pulse.backend.requests.UpdatePostRequest
import org.pulse.backend.services.PostService
import org.pulse.backend.entities.user.User
import org.pulse.backend.services.ChatMemberService
import org.pulse.backend.services.ChatService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/posts")
class PostController(
    private val postService: PostService,
    private val memberService: ChatMemberService,
    private val chatService: ChatService
) {
    @GetMapping("/{postId}")
    fun getPostById(@PathVariable postId: Long): Post {
        return postService.getPostById(postId)
    }

    @GetMapping("/{postId}/comments")
    fun getComments(@PathVariable postId: Long): Chat {
        return postService.getPostById(postId).comments!!
    }

    @GetMapping("/{postId}/comments/join")
    fun joinComments(@AuthenticationPrincipal user: User, @PathVariable postId: Long): Chat {
        val post = postService.getPostById(postId)

        if (!post.channel.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        if (post.comments!!.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }

        memberService.createMember(post.comments!!, user)

        return chatService.getChatById(post.comments!!.id!!)
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