package org.pulse.backend.controllers

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.post.Post
import org.pulse.backend.requests.UpdatePostRequest
import org.pulse.backend.services.PostService
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.dispatchers.PostEventDispatcher
import org.pulse.backend.services.ChannelMemberService
import org.pulse.backend.services.ChannelService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/posts")
class PostController(
    private val postService: PostService,
    private val memberService: ChannelMemberService,
    private val channelService: ChannelService,
    private val postEventDispatcher: PostEventDispatcher
) {
    @GetMapping("/{postId}")
    fun getPostById(@PathVariable postId: Long): Post {
        return postService.getPostById(postId)
    }

    @GetMapping("/{postId}/comments")
    fun getComments(@PathVariable postId: Long): Channel {
        return postService.getPostById(postId).comments!!
    }

    @GetMapping("/{postId}/comments/join")
    fun joinComments(@AuthenticationPrincipal user: User, @PathVariable postId: Long): Channel {
        val post = postService.getPostById(postId)

        if (!post.channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        if (post.comments!!.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }

        memberService.createMember(post.comments!!, user)

        return channelService.getChannelById(post.comments!!.id!!)
    }

    @PatchMapping("/{postId}")
    fun updatePost(
        @AuthenticationPrincipal user: User,
        @PathVariable postId: Long,
        @RequestBody request: UpdatePostRequest
    ): Post {
        val post = postService.getPostById(postId)

        if (post.channel.admin!!.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return postService.updatePost(postId, request.content).also {
            postEventDispatcher.dispatchUpdatePostEvent(it)
        }
    }

    @DeleteMapping("/{postId}")
    fun deletePost(@AuthenticationPrincipal user: User, @PathVariable postId: Long) {
        val post = postService.getPostById(postId)

        if (post.channel.admin!!.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        postService.deletePost(postId).also {
            postEventDispatcher.dispatchUpdatePostEvent(post)
        }
    }
}