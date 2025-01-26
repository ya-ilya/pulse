package org.pulse.backend

import org.pulse.backend.services.ChannelService
import org.pulse.backend.services.UserService
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["org.pulse.backend"])
class PulseApplication(
    private val userService: UserService,
    private val channelService: ChannelService
) : CommandLineRunner {
    override fun run(vararg args: String) {
        if (userService.findUserByUsername("Ilya").isPresent) {
            return
        }

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

        for (i in 0..100) {
            val groupChat = channelService.createGroupChatChannel(
                "Group Chat $i",
                ilya,
                listOf(pavel)
            )
        }

        val privateChat = channelService.createPrivateChatChannel(
            ilya,
            pavel
        )
    }
}

fun main(args: Array<String>) {
    runApplication<PulseApplication>(*args)
}
