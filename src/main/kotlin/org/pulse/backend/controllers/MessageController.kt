package org.pulse.backend.controllers

import org.pulse.backend.entities.message.Message
import org.pulse.backend.requests.UpdateMessageRequest
import org.pulse.backend.services.MessageService
import org.pulse.backend.entities.user.User
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/messages")
class MessageController(private val messageService: MessageService) {
    @GetMapping("/{messageId}")
    fun getMessageById(@AuthenticationPrincipal user: User, @PathVariable messageId: Long): Message {
        val message = messageService.getMessageById(messageId)

        if (!message.chat.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found")
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

        if (message.user != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return messageService.updateMessage(messageId, request.content)
    }

    @DeleteMapping("/{messageId}")
    fun deleteMessage(@AuthenticationPrincipal user: User, @PathVariable messageId: Long) {
        val message = messageService.getMessageById(messageId)

        if (message.user != user && message.chat.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        messageService.deleteMessage(messageId)
    }
}