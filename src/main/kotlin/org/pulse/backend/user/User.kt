package org.pulse.backend.user

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import java.lang.reflect.Member
import java.util.UUID

@Entity
class User(
    val username: String,
    val email: String,
    val password: String,
    @OneToMany(mappedBy = "user")
    val membering: List<Member> = listOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
)