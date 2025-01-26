package org.pulse.backend.controllers

import jakarta.validation.Valid
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.channel.ChannelType
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.dispatchers.ChannelEventDispatcher
import org.pulse.backend.gateway.dispatchers.MessageEventDispatcher
import org.pulse.backend.requests.*
import org.pulse.backend.services.ChannelMemberService
import org.pulse.backend.services.ChannelService
import org.pulse.backend.services.MessageService
import org.pulse.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/channels")
class ChannelController(
    private val channelService: ChannelService,
    private val memberService: ChannelMemberService,
    private val userService: UserService,
    private val messageService: MessageService,
    private val channelEventDispatcher: ChannelEventDispatcher,
    private val messageEventDispatcher: MessageEventDispatcher
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

        if (channel.type != ChannelType.Channel && !channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        return channel.messages
    }

    @PostMapping("/{channelId}/messages")
    fun createMessage(
        @AuthenticationPrincipal user: User,
        @PathVariable channelId: Long,
        @Valid @RequestBody request: CreateMessageRequest
    ): Message {
        val channel = channelService.getChannelById(channelId)

        if (!channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }

        if (channel.type == ChannelType.Channel && channel.admin?.id != user.id) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }

        return if (channel.type == ChannelType.Channel) {
            messageService.createPost(request.content.trim(), channel).also {
                messageEventDispatcher.dispatchCreateMessageEvent(it)
            }
        } else {
            messageService.createMessage(request.content.trim(), channel, user).also {
                messageEventDispatcher.dispatchCreateMessageEvent(it)
            }
        }
    }

    @PostMapping
    fun createChannel(@AuthenticationPrincipal user: User, @Valid @RequestBody request: CreateChannelRequest): Channel {
        return channelService.createChannel(request.name, user).also {
            channelEventDispatcher.dispatchCreateChannelEvent(it)
        }
    }

    @PostMapping("/privateChat")
    fun createPrivateChatChannel(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: CreatePrivateChatRequest
    ): Channel {
        val other = userService.getUserById(request.with)

        if (user.channels.any { it.channel.type == ChannelType.PrivateChat && it.channel.members.any { it.user.id == other.id } }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }

        return channelService.createPrivateChatChannel(user, other).also {
            channelEventDispatcher.dispatchCreateChannelEvent(it)
        }
    }

    @PostMapping("/groupChat")
    fun createGroupChatChannel(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: CreateGroupChatRequest
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
        @Valid @RequestBody request: UpdateChannelRequest
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