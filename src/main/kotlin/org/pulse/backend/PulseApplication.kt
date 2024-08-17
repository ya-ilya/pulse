package org.pulse.backend

import org.pulse.backend.services.ChannelService
import org.pulse.backend.services.UserService
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan

@ComponentScan
@SpringBootApplication
class PulseApplication(
    private val userService: UserService,
    private val channelService: ChannelService
) : CommandLineRunner {
    override fun run(vararg args: String) {
        val ilya = userService.createUser(
            "Ilya",
            "ilya@mail.com",
            "password"
        )

        val pavel = userService.createUser(
            "Pavel",
            "pavel@mail.com",
            "password"
        )

        val groupChat = channelService.createGroupChatChannel(
            "Group Chat",
            ilya,
            listOf(pavel)
        )
    }
}

fun main(args: Array<String>) {
    runApplication<PulseApplication>(*args)
}
