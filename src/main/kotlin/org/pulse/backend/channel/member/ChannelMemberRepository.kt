package org.pulse.backend.channel.member

import org.springframework.data.jpa.repository.JpaRepository

interface ChannelMemberRepository : JpaRepository<ChannelMember, Long>