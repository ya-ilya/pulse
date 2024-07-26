package org.pulse.backend.entities.channel

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.pulse.backend.entities.channel.member.ChannelMember
import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.user.User

@Entity
class Channel(
    var name: String,
    @ManyToOne
    val admin: User? = null,
    @JsonIgnore
    @OneToMany(mappedBy = "channel")
    val members: List<ChannelMember> = emptyList(),
    @JsonIgnore
    @OneToMany(mappedBy = "channel")
    val posts: List<Post> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)