package org.pulse.backend.controllers

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.services.ChannelService
import org.pulse.backend.services.ChannelMemberService
import org.pulse.backend.requests.CreateChannelRequest
import org.pulse.backend.requests.UpdateChannelRequest
import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.user.User
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/channels")
class ChannelController(
    private val channelService: ChannelService,
    private val memberService: ChannelMemberService
) {
    @GetMapping
    fun getChannels(@AuthenticationPrincipal user: User): List<Channel> {
        return user.channels.map { it.channel }
    }

    @GetMapping("/{channelId}")
    fun getChannelById(@PathVariable channelId: Long): Channel {
        return channelService.getChannelById(channelId)
    }

    @GetMapping("/{channelId}/members")
    fun getMembers(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): List<User> {
        val channel = channelService.getChannelById(channelId)

        if (channel.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return channel.members.map { it.user }
    }

    @GetMapping("/{channelId}/posts")
    fun getPosts(@PathVariable channelId: Long): List<Post> {
        return channelService.getChannelById(channelId).posts
    }

    @PostMapping
    fun createChannel(@AuthenticationPrincipal user: User, @RequestBody request: CreateChannelRequest): Channel {
        return channelService.createChannel(request.name, user)
    }

    @PatchMapping("/{channelId}")
    fun updateChannel(
        @AuthenticationPrincipal user: User,
        @PathVariable channelId: Long,
        @RequestBody request: UpdateChannelRequest
    ): Channel {
        val channel = channelService.getChannelById(channelId)

        if (channel.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return channelService.updateChannel(channelId, request.name)
    }

    @DeleteMapping("/{channelId}")
    fun deleteChannel(@AuthenticationPrincipal user: User, @PathVariable channelId: Long) {
        val channel = channelService.getChannelById(channelId)

        if (channel.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        channelService.deleteChannel(channelId)
    }

    @GetMapping("/{channelId}/join")
    fun join(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): Channel {
        val channel = channelService.getChannelById(channelId)

        if (channel.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        memberService.createMember(channel, user)

        return channelService.getChannelById(channelId)
    }
}