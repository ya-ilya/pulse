package org.pulse.backend.channel.member

import org.pulse.backend.channel.Channel
import org.pulse.backend.user.User
import org.springframework.stereotype.Service

@Service
class ChannelMemberService(private val memberRepository: ChannelMemberRepository) {
    fun createMember(channel: Channel, user: User): ChannelMember {
        return memberRepository.save(ChannelMember(channel, user))
    }
}