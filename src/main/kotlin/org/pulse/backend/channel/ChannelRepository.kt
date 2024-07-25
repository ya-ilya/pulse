package org.pulse.backend.channel

import org.springframework.data.jpa.repository.JpaRepository

interface ChannelRepository : JpaRepository<Channel, Long>