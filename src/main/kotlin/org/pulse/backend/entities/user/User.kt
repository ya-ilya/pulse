package org.pulse.backend.entities.user

import jakarta.persistence.*
import org.pulse.backend.entities.channel.member.ChannelMember
import org.pulse.backend.entities.chat.member.ChatMember
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.*

@Entity
class User(
    @get:JvmName("usernameField")
    var username: String,
    val displayName: String,
    val email: String,
    @get:JvmName("passwordField")
    val password: String,
    var accessToken: String? = null,
    var refreshToken: String? = null,
    @OneToMany(mappedBy = "user")
    val chats: List<ChatMember> = emptyList(),
    @OneToMany(mappedBy = "user")
    val channels: List<ChannelMember> = emptyList(),
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) : UserDetails {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return mutableSetOf()
    }

    override fun getPassword(): String {
        return password
    }

    override fun getUsername(): String {
        return email
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun isEnabled(): Boolean {
        return true
    }
}