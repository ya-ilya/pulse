package org.pulse.backend.member

import org.pulse.backend.chat.Chat
import org.pulse.backend.user.User
import org.springframework.stereotype.Service

@Service
class MemberService(private val memberRepository: MemberRepository) {
    fun createMember(user: User, chat: Chat): Member {
        return memberRepository.save(
            Member(chat, user)
        )
    }
}