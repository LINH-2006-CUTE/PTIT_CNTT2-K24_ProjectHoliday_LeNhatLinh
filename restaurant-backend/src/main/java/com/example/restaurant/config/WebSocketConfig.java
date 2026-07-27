package com.example.restaurant.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final KitchenWebSocketHandler kitchenWebSocketHandler;

    public WebSocketConfig(KitchenWebSocketHandler kitchenWebSocketHandler) {
        this.kitchenWebSocketHandler = kitchenWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(kitchenWebSocketHandler, "/ws-kitchen")
                .setAllowedOrigins("*");
    }
}
