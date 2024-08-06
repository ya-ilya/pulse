package org.pulse.backend.configurations

import org.pulse.backend.gateway.Gateway
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Controller
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Controller
@Configuration
@EnableWebSocket
class WebSocketConfiguration(private val gateway: Gateway) : WebSocketConfigurer {
    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(gateway, "/gateway")
    }
}