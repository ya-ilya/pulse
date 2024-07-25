package org.pulse.backend.chat.member

import org.pulse.backend.chat.Chat
import org.pulse.backend.user.User
import org.springframework.stereotype.Service

@Service
class ChatMemberService(private val memberRepository: ChatMemberRepository) {
    fun createMember(chat: Chat, user: User): ChatMember {
        return memberRepository.save(
            ChatMember(chat, user)
        )
    }
}