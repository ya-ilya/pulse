package org.pulse.backend.services

import org.pulse.backend.entities.chat.Chat
import org.pulse.backend.entities.chat.member.ChatMember
import org.pulse.backend.entities.chat.member.ChatMemberRepository
import org.pulse.backend.entities.user.User
import org.springframework.stereotype.Service

@Service
class ChatMemberService(private val memberRepository: ChatMemberRepository) {
    fun createMember(chat: Chat, user: User): ChatMember {
        return memberRepository.save(
            ChatMember(chat, user)
        )
    }
}