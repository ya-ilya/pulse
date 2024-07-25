package org.pulse.backend.chat

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import org.pulse.backend.member.Member
import org.pulse.backend.message.Message

@Entity
class Chat(
    val type: ChatType,
    @OneToMany(mappedBy = "chat")
    val members: List<Member> = emptyList(),
    @OneToMany(mappedBy = "chat")
    val messages: List<Message> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)