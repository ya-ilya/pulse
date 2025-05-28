package org.pulse.backend.controllers

import jakarta.validation.Valid
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.dispatchers.MessageEventDispatcher
import org.pulse.backend.requests.UpdateMessageRequest
import org.pulse.backend.responses.ChannelResponse
import org.pulse.backend.responses.MessageResponse
import org.pulse.backend.services.MessageService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/messages")
class MessageController(
    private val messageService: MessageService,
    private val messageEventDispatcher: MessageEventDispatcher
) {
    @GetMapping("/{messageId}")
    fun getMessageById(@AuthenticationPrincipal user: User, @PathVariable messageId: Long): MessageResponse =
        messageService.getMessageByIdForUser(user, messageId)

    @GetMapping("/{messageId}/comments")
    fun getComments(@PathVariable messageId: Long): ChannelResponse =
        messageService.getCommentsChannel(messageId)

    @GetMapping("/{messageId}/comments/join")
    fun joinComments(@AuthenticationPrincipal user: User, @PathVariable messageId: Long): ChannelResponse =
        messageService.joinCommentsChannel(user, messageId)

    @PatchMapping("/{messageId}")
    fun updateMessage(
        @AuthenticationPrincipal user: User,
        @PathVariable messageId: Long,
        @Valid @RequestBody request: UpdateMessageRequest
    ): MessageResponse {
        val message = messageService.updateMessageForUser(user, messageId, request.content)
        messageEventDispatcher.dispatchUpdateMessageContentEvent(message)
        return message.toResponse()
    }

    @DeleteMapping("/{messageId}")
    fun deleteMessage(@AuthenticationPrincipal user: User, @PathVariable messageId: Long) {
        val message = messageService.deleteMessageForUser(user, messageId)
        messageEventDispatcher.dispatchDeleteMessageEvent(message)
    }
}