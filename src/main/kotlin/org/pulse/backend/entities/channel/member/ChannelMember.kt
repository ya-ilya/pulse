package org.pulse.backend.entities.channel.member

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.ManyToOne
import org.pulse.backend.entities.channel.Channel
import org.pulse.backend.entities.user.User

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