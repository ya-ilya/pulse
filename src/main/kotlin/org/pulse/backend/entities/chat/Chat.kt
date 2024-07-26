package org.pulse.backend.entities.chat

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import org.pulse.backend.entities.chat.member.ChatMember
import org.pulse.backend.entities.message.Message
import org.pulse.backend.entities.post.Post
import org.pulse.backend.entities.user.User

@Entity
class Chat(
    val type: ChatType,
    var name: String? = null,
    @ManyToOne
    val admin: User? = null,
    @OneToOne(mappedBy = "comments")
    val post: Post? = null,
    @OneToMany(mappedBy = "chat")
    @JsonIgnore
    val members: List<ChatMember> = emptyList(),
    @OneToMany(mappedBy = "chat")
    @JsonIgnore
    val messages: List<Message> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)