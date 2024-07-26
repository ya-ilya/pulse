package org.pulse.backend.entities.channel.member

import org.springframework.data.jpa.repository.JpaRepository

interface ChannelMemberRepository : JpaRepository<ChannelMember, Long>