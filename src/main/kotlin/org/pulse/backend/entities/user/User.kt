package org.pulse.backend.entities.user

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.*
import org.pulse.backend.entities.channel.member.ChannelMember
import org.pulse.backend.gateway.Gateway
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.util.*

@Entity
class User(
    @get:JvmName("usernameField")
    @get:JsonProperty("username")
    var username: String,
    val displayName: String,
    @JsonIgnore
    val email: String,
    @JsonIgnore
    @get:JvmName("passwordField")
    val password: String,
    @JsonIgnore
    var accessToken: String? = null,
    @JsonIgnore
    var refreshToken: String? = null,
    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    @JsonIgnore
    val channels: MutableList<ChannelMember> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) : UserDetails {
    @JsonIgnore
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return mutableSetOf()
    }

    @JsonIgnore
    override fun getPassword(): String {
        return password
    }

    @JsonIgnore
    override fun getUsername(): String {
        return email
    }

    @JsonIgnore
    override fun isAccountNonExpired(): Boolean {
        return true
    }

    @JsonIgnore
    override fun isAccountNonLocked(): Boolean {
        return true
    }

    @JsonIgnore
    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    @JsonIgnore
    override fun isEnabled(): Boolean {
        return true
    }
}