package org.pulse.backend.entities.channel.member

import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.user.User
import org.springframework.data.jpa.repository.JpaRepository

interface ChannelMemberRepository : JpaRepository<ChannelMember, Long> {
    fun findByChannel(channel: Channel): List<ChannelMember>
    fun deleteByChannelAndUser(channel: Channel, user: User)
}