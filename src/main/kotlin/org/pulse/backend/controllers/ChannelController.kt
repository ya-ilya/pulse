package org.pulse.backend.controllers

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.channel.ChannelType
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.dispatchers.ChannelEventDispatcher
import org.pulse.backend.gateway.dispatchers.MessageEventDispatcher
import org.pulse.backend.gateway.dispatchers.PostEventDispatcher
import org.pulse.backend.requests.*
import org.pulse.backend.services.*
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/channels")
class ChannelController(
    private val channelService: ChannelService,
    private val memberService: ChannelMemberService,
    private val postService: PostService,
    private val userService: UserService,
    private val messageService: MessageService,
    private val channelEventDispatcher: ChannelEventDispatcher,
    private val messageEventDispatcher: MessageEventDispatcher,
    private val postEventDispatcher: PostEventDispatcher
) {
    @GetMapping
    fun getChannels(@AuthenticationPrincipal user: User): List<Channel> {
        return user.channels.map { it.channel }
    }

    @GetMapping("/{channelId}")
    fun getChannelById(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): Channel {
        val channel = channelService.getChannelById(channelId)

        if (channel.type != ChannelType.Channel && !channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        return channel
    }

    @GetMapping("/{channelId}/members")
    fun getMembers(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): List<User> {
        val channel = channelService.getChannelById(channelId)

        if (channel.type != ChannelType.Channel && !channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        if (channel.type == ChannelType.GroupChat && channel.admin?.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return channel.members.map { it.user }
    }

    @GetMapping("/{channelId}/messages")
    fun getMessages(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): List<Message> {
        val channel = channelService.getChannelById(channelId)

        if (!channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        if (channel.type == ChannelType.Channel) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }

        return channel.messages
    }

    @GetMapping("/{channelId}/posts")
    fun getPosts(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): List<Post> {
        val channel = channelService.getChannelById(channelId)

        if (channel.type != ChannelType.Channel) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }

        return channel.posts
    }

    @PostMapping("/{channelId}/messages")
    fun createMessage(
        @AuthenticationPrincipal user: User,
        @PathVariable channelId: Long,
        @RequestBody request: CreateMessageRequest
    ): Message {
        val channel = channelService.getChannelById(channelId)

        if (!channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        if (channel.type == ChannelType.Channel) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }

        return messageService.createMessage(request.content, channel, user).also {
            messageEventDispatcher.dispatchCreateMessageEvent(it)
        }
    }

    @PostMapping("/{channelId}/posts")
    fun createPost(
        @AuthenticationPrincipal user: User,
        @PathVariable channelId: Long,
        @RequestBody request: CreatePostRequest
    ): Post {
        val channel = channelService.getChannelById(channelId)

        if (channel.type != ChannelType.Channel) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }

        if (channel.admin!!.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return postService.createPost(request.content, channel).also {
            postEventDispatcher.dispatchCreatePostEvent(it)
        }
    }

    @PostMapping
    fun createChannel(@AuthenticationPrincipal user: User, @RequestBody request: CreateChannelRequest): Channel {
        return channelService.createChannel(request.name, user).also {
            channelEventDispatcher.dispatchCreateChannelEvent(it)
        }
    }

    @PostMapping("/privateChat")
    fun createPrivateChatChannel(
        @AuthenticationPrincipal user: User,
        @RequestBody request: CreatePrivateChatRequest
    ): Channel {
        return channelService.createPrivateChatChannel(
            user,
            userService.getUserById(request.with)
        ).also {
            channelEventDispatcher.dispatchCreateChannelEvent(it)
        }
    }

    @PostMapping("/groupChat")
    fun createGroupChatChannel(
        @AuthenticationPrincipal user: User,
        @RequestBody request: CreateGroupChatRequest
    ): Channel {
        return channelService.createGroupChatChannel(
            request.name,
            user,
            request.with.map { userService.getUserById(it) }
        ).also {
            channelEventDispatcher.dispatchCreateChannelEvent(it)
        }
    }

    @PatchMapping("/{channelId}")
    fun updateChannel(
        @AuthenticationPrincipal user: User,
        @PathVariable channelId: Long,
        @RequestBody request: UpdateChannelRequest
    ): Channel {
        val channel = channelService.getChannelById(channelId)

        if (channel.type != ChannelType.GroupChat && channel.type != ChannelType.Channel) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        if (channel.admin!!.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return channelService.updateChannel(channelId, request.name).also {
            channelEventDispatcher.dispatchUpdateChannelNameEvent(it)
        }
    }

    @DeleteMapping("/{channelId}")
    fun deleteChannel(@AuthenticationPrincipal user: User, @PathVariable channelId: Long) {
        val channel = channelService.getChannelById(channelId)

        if (!channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        if (channel.type != ChannelType.PrivateChat && channel.admin?.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        channelService.deleteChannel(channelId).also {
            channelEventDispatcher.dispatchDeleteChannelEvent(channel)
        }
    }

    @GetMapping("/{channelId}/join")
    fun join(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): Channel {
        val channel = channelService.getChannelById(channelId)

        if (channel.type != ChannelType.Channel) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        if (channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }

        memberService.createMember(channel, user)

        return channelService.getChannelById(channelId).also {
            channelEventDispatcher.dispatchUpdateChannelMembersEvent(it)
        }
    }
}