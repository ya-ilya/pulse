package org.pulse.backend.controllers

import jakarta.transaction.Transactional
import jakarta.validation.Valid
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.dispatchers.ChannelEventDispatcher
import org.pulse.backend.gateway.dispatchers.MessageEventDispatcher
import org.pulse.backend.gateway.events_s2c.UpdateChannelMembersS2CEvent
import org.pulse.backend.requests.*
import org.pulse.backend.responses.ChannelResponse
import org.pulse.backend.responses.MessageResponse
import org.pulse.backend.responses.UserResponse
import org.pulse.backend.services.ChannelService
import org.pulse.backend.services.UserService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/channels")
class ChannelController(
    private val channelService: ChannelService,
    private val userService: UserService,
    private val channelEventDispatcher: ChannelEventDispatcher,
    private val messageEventDispatcher: MessageEventDispatcher
) {
    @GetMapping
    fun getChannels(@AuthenticationPrincipal user: User): List<ChannelResponse> =
        channelService.getUserChannels(user)

    @GetMapping("/{channelId}")
    fun getChannelById(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): ChannelResponse =
        channelService.getChannelByIdForUser(user, channelId)

    @GetMapping("/{channelId}/members")
    fun getMembers(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): List<UserResponse> =
        channelService.getChannelMembersForUser(user, channelId)

    @GetMapping("/{channelId}/messages")
    fun getMessages(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): List<MessageResponse> =
        channelService.getChannelMessagesForUser(user, channelId)

    @PostMapping("/{channelId}/messages")
    fun createMessage(
        @AuthenticationPrincipal user: User,
        @PathVariable channelId: Long,
        @Valid @RequestBody request: CreateMessageRequest
    ): MessageResponse {
        val message = channelService.createMessageInChannel(user, channelId, request.content.trim())
        messageEventDispatcher.dispatchCreateMessageEvent(message)
        return message.toResponse()
    }

    @PostMapping
    fun createChannel(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: CreateChannelRequest
    ): ChannelResponse {
        return channelService.createChannel(request.name, user).also {
            channelEventDispatcher.dispatchCreateChannelEvent(it)
        }.toResponse()
    }

    @PostMapping("/privateChat")
    fun createPrivateChatChannel(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: CreatePrivateChatRequest
    ): ChannelResponse {
        val other = userService.getUserById(request.with)
        val channel = channelService.createPrivateChatChannelForUser(user, other)
        channelEventDispatcher.dispatchCreateChannelEvent(channel)
        return channel.toResponse()
    }

    @PostMapping("/groupChat")
    fun createGroupChatChannel(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: CreateGroupChatRequest
    ): ChannelResponse {
        val channel = channelService.createGroupChatChannel(
            request.name,
            user,
            request.with.map { userService.getUserById(it) }
        )
        channelEventDispatcher.dispatchCreateChannelEvent(channel)
        return channel.toResponse()
    }

    @PatchMapping("/{channelId}")
    fun updateChannel(
        @AuthenticationPrincipal user: User,
        @PathVariable channelId: Long,
        @Valid @RequestBody request: UpdateChannelRequest
    ): ChannelResponse {
        val channel = channelService.updateChannelForUser(user, channelId, request.name)
        channelEventDispatcher.dispatchUpdateChannelNameEvent(channel)
        return channel.toResponse()
    }

    @DeleteMapping("/{channelId}")
    fun deleteChannel(@AuthenticationPrincipal user: User, @PathVariable channelId: Long) {
        val channel = channelService.deleteChannelForUser(user, channelId)
        channelEventDispatcher.dispatchDeleteChannelEvent(channel)
    }

    @GetMapping("/{channelId}/join")
    fun joinChannel(@AuthenticationPrincipal user: User, @PathVariable channelId: Long): ChannelResponse {
        val channel = channelService.joinChannel(user, channelId)
        channelEventDispatcher.dispatchUpdateChannelMembersEvent(
            channel,
            user,
            UpdateChannelMembersS2CEvent.Action.Join
        )
        return channel.toResponse()
    }

    @Transactional
    @GetMapping("/{channelId}/leave")
    fun leaveChannel(@AuthenticationPrincipal user: User, @PathVariable channelId: Long) {
        val (channel, leftUser, statusMessage) = channelService.leaveChannel(user, channelId)
        channelEventDispatcher.dispatchUpdateChannelMembersEvent(
            channel,
            leftUser,
            UpdateChannelMembersS2CEvent.Action.Leave,
            extraUser = leftUser
        )
        if (statusMessage != null) {
            messageEventDispatcher.dispatchCreateMessageEvent(statusMessage)
        }
    }
}