package org.pulse.backend.chat.member

import org.springframework.data.jpa.repository.JpaRepository

interface ChatMemberRepository : JpaRepository<ChatMember, Long>