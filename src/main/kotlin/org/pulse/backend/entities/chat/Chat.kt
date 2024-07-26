package org.pulse.backend.entities.chat

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
    val members: List<ChatMember> = emptyList(),
    @OneToMany(mappedBy = "chat")
    val messages: List<Message> = emptyList(),
    @Id
    @GeneratedValue
    val id: Long? = null
)