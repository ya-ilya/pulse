package org.pulse.backend.entities.channel

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.pulse.backend.entities.channel.member.ChannelMember
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.user.User
import org.springframework.security.core.context.SecurityContextHolder

@Entity
class Channel(
    val type: ChannelType? = null,
    name: String? = null,
    @ManyToOne
    val admin: User? = null,
    @OneToOne(mappedBy = "comments")
    @JsonIgnore
    val post: Message? = null,
    @JsonIgnore
    @OneToMany(mappedBy = "channel", fetch = FetchType.EAGER)
    val members: MutableList<ChannelMember> = mutableListOf(),
    @JsonIgnore
    @OneToMany(mappedBy = "channel")
    val messages: MutableList<Message> = mutableListOf(),
    @Id
    @GeneratedValue
    val id: Long? = null
) {
    var name: String? = name
        get() {
            if (field == null && type == ChannelType.PrivateChat) {
                val principal = SecurityContextHolder.getContext().authentication.principal

                if (principal != null && principal is User) {
                    return members.map { it.user }.first { it.id != principal.id }.username
                }
            }

            return field
        }
}