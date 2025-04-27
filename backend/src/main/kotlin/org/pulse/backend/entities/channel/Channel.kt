package org.pulse.backend.entities.channel

import jakarta.persistence.*
import org.pulse.backend.entities.channel.member.ChannelMember
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.user.User
import org.pulse.backend.responses.ChannelResponse
import org.springframework.security.core.context.SecurityContextHolder

@Entity
class Channel(
    val type: ChannelType? = null,
    name: String? = null,
    @ManyToOne
    val admin: User? = null,
    @OneToOne(mappedBy = "comments")
    val post: Message? = null,
    @OneToMany(mappedBy = "channel", fetch = FetchType.EAGER)
    val members: MutableList<ChannelMember> = mutableListOf(),
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
                    val secondUser = members.map { it.user }.first { it.id != principal.id }
                    return "${secondUser.displayName} (@${secondUser.username})"
                }
            }

            return field
        }

    fun toResponse(): ChannelResponse {
        return ChannelResponse(
            type,
            name,
            admin?.toResponse(),
            id!!
        )
    }
}