package org.pulse.backend.entities.channel

import jakarta.persistence.*
import org.pulse.backend.entities.channel.member.ChannelMember
import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.user.User

@Entity
class Channel(
    var name: String,
    @ManyToOne
    val admin: User? = null,
    @OneToMany(mappedBy = "channel")
    val members: List<ChannelMember> = emptyList(),
    @OneToMany(mappedBy = "channel")
    val posts: List<Post> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)