package org.pulse.backend.entities.channel.member

import jakarta.persistence.*
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.user.User

@Entity
class ChannelMember(
    @ManyToOne(fetch = FetchType.EAGER)
    val channel: Channel,
    @ManyToOne(fetch = FetchType.EAGER)
    val user: User,
    @Id
    @GeneratedValue
    val id: Long? = null
) {
    operator fun component1() = channel
    operator fun component2() = user
}