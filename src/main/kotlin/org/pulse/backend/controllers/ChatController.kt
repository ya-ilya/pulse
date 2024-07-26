package org.pulse.backend.controllers

import org.pulse.backend.entities.chat.Chat
import org.pulse.backend.services.ChatService
import org.pulse.backend.requests.CreateGroupChatRequest
import org.pulse.backend.requests.CreatePrivateChatRequest
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.user.User
import org.pulse.backend.requests.AddMemberRequest
import org.pulse.backend.requests.CreateMessageRequest
import org.pulse.backend.services.ChatMemberService
import org.pulse.backend.services.MessageService
import org.pulse.backend.services.UserService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/chats")
class ChatController(
    private val chatService: ChatService,
    private val userService: UserService,
    private val memberService: ChatMemberService,
    private val messageService: MessageService
) {
    @GetMapping
    fun getChats(@AuthenticationPrincipal user: User): List<Chat> {
        return user.chats.map { it.chat }
    }

    @GetMapping("/{chatId}")
    fun getChatById(@AuthenticationPrincipal user: User, @PathVariable chatId: Long): Chat {
        val chat = chatService.getChatById(chatId)

        if (!chat.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found")
        }

        return chat
    }

    @GetMapping("/{chatId}/members")
    fun getMembers(@AuthenticationPrincipal user: User, @PathVariable chatId: Long): List<User> {
        val chat = chatService.getChatById(chatId)

        if (!chat.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found")
        }

        return chat.members.map { it.user }
    }

    @PostMapping("/{chatId}/members")
    fun addMember(@AuthenticationPrincipal user: User, @PathVariable chatId: Long, @RequestBody request: AddMemberRequest): Chat {
        val chat = chatService.getChatById(chatId)

        if (chat.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        val userToAdd = userService.getUserById(request.userId)

        if (chat.members.any { it.user == userToAdd }) {
            throw ResponseStatusException(HttpStatus.CONFLICT)
        }

        memberService.createMember(chat, user)

        return chatService.getChatById(chatId)
    }

    @GetMapping("/{chatId}/messages")
    fun getMessages(@AuthenticationPrincipal user: User, @PathVariable chatId: Long): List<Message> {
        val chat = chatService.getChatById(chatId)

        if (!chat.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found")
        }

        return chat.messages
    }

    @PostMapping("/{chatId}/messages")
    fun createMessage(@AuthenticationPrincipal user: User, @PathVariable chatId: Long, @RequestBody request: CreateMessageRequest): Message {
        val chat = chatService.getChatById(chatId)

        if (!chat.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found")
        }

        return messageService.createMessage(request.content, chat, user)
    }

    @PostMapping("/{chatId}")
    fun updateGroupChat(
        @AuthenticationPrincipal user: User,
        @PathVariable chatId: Long,
        @RequestBody request: CreateGroupChatRequest
    ): Chat {
        val chat = chatService.getChatById(chatId)

        if (chat.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        return chatService.updateGroupChat(chatId, request.name)
    }

    @PostMapping("/createPrivateChat")
    fun createPrivateChat(@AuthenticationPrincipal user: User, @RequestBody request: CreatePrivateChatRequest): Chat {
        return chatService.createPrivateChat(
            user,
            userService.getUserById(request.with)
        )
    }

    @PostMapping("/createGroupChat")
    fun createGroupChat(@AuthenticationPrincipal user: User, @RequestBody request: CreateGroupChatRequest): Chat {
        return chatService.createGroupChat(
            request.name,
            user,
            request.with.map { userService.getUserById(it) }
        )
    }

    @DeleteMapping("/{chatId}")
    fun deleteChat(@AuthenticationPrincipal user: User, @PathVariable chatId: Long) {
        val chat = chatService.getChatById(chatId)

        if (chat.admin != user) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }

        chatService.deleteChat(chatId)
    }
}