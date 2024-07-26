package org.pulse.backend.entities.chat.member

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.entities.chat.Chat
import org.pulse.backend.entities.user.User

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