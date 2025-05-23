package org.pulse.backend.controllers

import jakarta.validation.Valid
import org.pulse.backend.entities.message.MessageType
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.dispatchers.MessageEventDispatcher
import org.pulse.backend.requests.UpdateMessageRequest
import org.pulse.backend.responses.ChannelResponse
import org.pulse.backend.responses.MessageResponse
import org.pulse.backend.services.ChannelMemberService
import org.pulse.backend.services.ChannelService
import org.pulse.backend.services.MessageService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/messages")
class MessageController(
    private val messageService: MessageService,
    private val memberService: ChannelMemberService,
    private val channelService: ChannelService,
    private val messageEventDispatcher: MessageEventDispatcher
) {
    @GetMapping("/{messageId}")
    fun getMessageById(@AuthenticationPrincipal user: User, @PathVariable messageId: Long): MessageResponse {
        val message = messageService.getMessageById(messageId)

        if (message.type == MessageType.Message && !message.channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found")
        }

        return message.toResponse()
    }

    @GetMapping("/{messageId}/comments")
    fun getComments(@PathVariable messageId: Long): ChannelResponse {
        return messageService.getMessageById(messageId).comments!!.toResponse()
    }

    @GetMapping("/{messageId}/comments/join")
    fun joinComments(@AuthenticationPrincipal user: User, @PathVariable messageId: Long): ChannelResponse {
        val message = messageService.getMessageById(messageId)

        if (!message.channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        if (message.comments!!.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }

        memberService.createMember(message.comments!!, user)

        return channelService.getChannelById(message.comments!!.id!!).toResponse()
    }

    @PatchMapping("/{messageId}")
    fun updateMessage(
        @AuthenticationPrincipal user: User,
        @PathVariable messageId: Long,
        @Valid @RequestBody request: UpdateMessageRequest
    ): MessageResponse {
        val message = messageService.getMessageById(messageId)

        when (message.type) {
            MessageType.Message -> {
                if (message.user?.id != user.id) {
                    throw ResponseStatusException(HttpStatus.FORBIDDEN)
                }
            }

            MessageType.Post -> {
                if (message.channel.admin?.id != user.id) {
                    throw ResponseStatusException(HttpStatus.FORBIDDEN)
                }
            }

            MessageType.Status -> throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return messageService.updateMessage(messageId, request.content).also {
            messageEventDispatcher.dispatchUpdateMessageContentEvent(it)
        }.toResponse()
    }

    @DeleteMapping("/{messageId}")
    fun deleteMessage(@AuthenticationPrincipal user: User, @PathVariable messageId: Long) {
        val message = messageService.getMessageById(messageId)

        val isOwner = message.user?.id == user.id
        val isAdmin = message.channel.admin?.id == user.id

        if (!isOwner && !isAdmin) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        messageEventDispatcher.dispatchDeleteMessageEvent(message)
        messageService.deleteMessage(messageId)
    }
}