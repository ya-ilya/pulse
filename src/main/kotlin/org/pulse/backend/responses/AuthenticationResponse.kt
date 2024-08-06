package org.pulse.backend.responses

import java.util.UUID

class AuthenticationResponse(
    val accessToken: String,
    val refreshToken: String,
    val userId: UUID
)