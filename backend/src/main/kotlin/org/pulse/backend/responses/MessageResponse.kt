package org.pulse.backend.responses

import org.pulse.backend.entities.message.MessageType
import java.sql.Timestamp

class MessageResponse(
    val type: MessageType,
    val timestamp: Timestamp,
    val content: String,
    val user: UserResponse?,
    val id: Long
)