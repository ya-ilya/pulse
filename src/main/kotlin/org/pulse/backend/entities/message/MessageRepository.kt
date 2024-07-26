package org.pulse.backend.entities.message

import org.springframework.data.jpa.repository.JpaRepository

interface MessageRepository : JpaRepository<Message, Long>