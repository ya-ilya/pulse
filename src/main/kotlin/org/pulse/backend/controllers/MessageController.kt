package org.pulse.backend.controllers

import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.user.User
import org.pulse.backend.gateway.dispatchers.MessageEventDispatcher
import org.pulse.backend.requests.UpdateMessageRequest
import org.pulse.backend.services.MessageService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/messages")
class MessageController(
    private val messageService: MessageService,
    private val messageEventDispatcher: MessageEventDispatcher
) {
    @GetMapping("/{messageId}")
    fun getMessageById(@AuthenticationPrincipal user: User, @PathVariable messageId: Long): Message {
        val message = messageService.getMessageById(messageId)

        if (!message.channel.members.any { it.user.id == user.id }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found")
        }

        return message
    }

    @PatchMapping("/{messageId}")
    fun updateMessage(
        @AuthenticationPrincipal user: User,
        @PathVariable messageId: Long,
        @RequestBody request: UpdateMessageRequest
    ): Message {
        val message = messageService.getMessageById(messageId)

        if (message.user.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return messageService.updateMessage(messageId, request.content).also {
            messageEventDispatcher.dispatchUpdateMessageContentEvent(it)
        }
    }

    @DeleteMapping("/{messageId}")
    fun deleteMessage(@AuthenticationPrincipal user: User, @PathVariable messageId: Long) {
        val message = messageService.getMessageById(messageId)

        if (message.user.id != user.id && message.channel.admin?.id != user.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        messageService.deleteMessage(messageId).also {
            messageEventDispatcher.dispatchDeleteMessageEvent(message)
        }
    }
}