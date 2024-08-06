package org.pulse.backend.services

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.channel.member.ChannelMember
import org.pulse.backend.entities.channel.member.ChannelMemberRepository
import org.pulse.backend.entities.user.User
import org.springframework.stereotype.Service

@Service
class ChannelMemberService(private val memberRepository: ChannelMemberRepository) {
    fun findMembersByChannel(channel: Channel): List<ChannelMember> {
        return memberRepository.findByChannel(channel)
    }

    fun createMember(channel: Channel, user: User): ChannelMember {
        return memberRepository.save(ChannelMember(channel, user))
    }
}