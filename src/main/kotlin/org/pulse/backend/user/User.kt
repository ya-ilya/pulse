package org.pulse.backend.user

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import org.pulse.backend.channel.member.ChannelMember
import org.pulse.backend.chat.member.ChatMember
import java.util.UUID

@Entity
class User(
    val username: String,
    val email: String,
    val password: String,
    @OneToMany(mappedBy = "user")
    val memberingChats: List<ChatMember> = emptyList(),
    @OneToMany(mappedBy = "user")
    val memberingChannels: List<ChannelMember> = emptyList(),
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
)