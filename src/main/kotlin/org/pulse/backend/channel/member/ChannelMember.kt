package org.pulse.backend.channel.member

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.channel.Channel
import org.pulse.backend.user.User

@Entity
class ChannelMember(
    @ManyToOne
    val channel: Channel,
    @ManyToOne
    val user: User,
    @Id
    @GeneratedValue
    val id: Long? = null
)