package com.blockchain.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> index() {
        return Map.of(
                "message", "Welcome to the Java Web3 API!",
                "status", "Running",
                "docs", "Try hitting the endpoints below:",
                "endpoints", Map.of(
                        "GET", "/api/greeting",
                        "POST", "/api/greeting (Requires JSON body: {\"greeting\": \"...\"})"
                )
        );
    }
}
