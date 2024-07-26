package org.pulse.backend.entities.chat.member

import org.springframework.data.jpa.repository.JpaRepository

interface ChatMemberRepository : JpaRepository<ChatMember, Long>