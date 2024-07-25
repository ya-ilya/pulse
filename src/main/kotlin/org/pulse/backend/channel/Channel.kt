package org.pulse.backend.channel

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import org.pulse.backend.channel.member.ChannelMember

@Entity
class Channel(
    val name: String,
    @OneToMany(mappedBy = "channel")
    val members: List<ChannelMember> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)