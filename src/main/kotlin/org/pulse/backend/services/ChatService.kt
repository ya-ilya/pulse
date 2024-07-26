package org.pulse.backend.services

import org.pulse.backend.entities.chat.Chat
import org.pulse.backend.entities.chat.ChatRepository
import org.pulse.backend.entities.chat.ChatType
import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.user.User
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class ChatService(
    private val chatRepository: ChatRepository,
    private val memberService: ChatMemberService
) {
    fun getChatById(chatId: Long): Chat {
        return chatRepository
            .findById(chatId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found") }
    }

    fun updateGroupChat(chatId: Long, name: String): Chat {
        return chatRepository.save(
            getChatById(chatId).apply { this.name = name }
        )
    }

    fun createPrivateChat(user: User, other: User): Chat {
        val chat = chatRepository.save(Chat(ChatType.Private))

        if (user.chats.any { member -> member.chat.type == ChatType.Private && member.chat.members.any { it.user == other } }) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }

        memberService.createMember(chat, user)
        memberService.createMember(chat, other)

        return chatRepository.findById(chat.id!!).get()
    }

    fun createGroupChat(name: String, user: User, other: List<User>): Chat {
        val chat = chatRepository.save(Chat(ChatType.Group, name = name, admin = user))

        memberService.createMember(chat, user)
        other.forEach { memberService.createMember(chat, it) }

        return chatRepository.findById(chat.id!!).get()
    }

    fun createCommentsChat(post: Post): Chat {
        return chatRepository.save(Chat(ChatType.Comments, post = post))
    }

    fun deleteChat(chatId: Long) {
        chatRepository.deleteById(chatId)
    }
}