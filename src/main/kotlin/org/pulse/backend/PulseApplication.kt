package org.pulse.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan

@ComponentScan
@SpringBootApplication
class PulseApplication

fun main(args: Array<String>) {
	runApplication<PulseApplication>(*args)
}
