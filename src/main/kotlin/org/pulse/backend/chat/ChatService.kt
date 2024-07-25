package org.pulse.backend.chat

import org.pulse.backend.chat.member.ChatMemberService
import org.pulse.backend.user.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class ChatService(
    private val chatRepository: ChatRepository,
    private val memberService: ChatMemberService
) {
    fun getChatById(user: User, chatId: Long): Chat {
        val chat = chatRepository
            .findById(chatId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found") }

        if (!chat.members.any { it.user == user }) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found")
        }

        return chat
    }

    fun createPrivateChat(user: User, other: User): Chat {
        val chat = chatRepository.save(Chat(ChatType.Private))

        memberService.createMember(chat, user)
        memberService.createMember(chat, other)

        return chatRepository.findById(chat.id!!).get()
    }

    fun createGroupChat(user: User, other: List<User>): Chat {
        val chat = chatRepository.save(Chat(ChatType.Group))

        memberService.createMember(chat, user)
        other.forEach { memberService.createMember(chat, it) }

        return chatRepository.findById(chat.id!!).get()
    }
}