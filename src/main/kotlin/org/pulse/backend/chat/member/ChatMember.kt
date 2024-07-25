package org.pulse.backend.chat.member

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.chat.Chat
import org.pulse.backend.user.User

@Entity
class ChatMember(
    @ManyToOne
    val chat: Chat,
    @ManyToOne
    val user: User,
    @Id
    @GeneratedValue
    val id: Long? = null
)