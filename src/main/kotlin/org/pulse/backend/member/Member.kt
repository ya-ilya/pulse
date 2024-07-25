package org.pulse.backend.member

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.chat.Chat
import org.pulse.backend.user.User

@Entity
class Member(
    @ManyToOne
    val chat: Chat,
    @ManyToOne
    val user: User,
    @Id
    @GeneratedValue
    val id: Long? = null
)