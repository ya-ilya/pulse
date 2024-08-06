package org.pulse.backend.entities.channel

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.pulse.backend.entities.channel.member.ChannelMember
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.user.User

@Entity
class Channel(
    val type: ChannelType? = null,
    var name: String? = null,
    @ManyToOne
    val admin: User? = null,
    @OneToOne(mappedBy = "comments")
    @JsonIgnore
    val post: Post? = null,
    @JsonIgnore
    @OneToMany(mappedBy = "channel", fetch = FetchType.EAGER)
    val members: MutableList<ChannelMember>  = mutableListOf(),
    @JsonIgnore
    @OneToMany(mappedBy = "channel")
    val messages: MutableList<Message>  = mutableListOf(),
    @JsonIgnore
    @OneToMany(mappedBy = "channel")
    val posts: MutableList<Post>  = mutableListOf(),
    @Id
    @GeneratedValue
    val id: Long? = null
)