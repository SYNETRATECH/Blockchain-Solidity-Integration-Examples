package com.blockchain.example.controller;

import com.blockchain.example.service.GreeterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/greeting")
public class GreeterController {

    private final GreeterService greeterService;

    public GreeterController(GreeterService greeterService) {
        this.greeterService = greeterService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getGreeting() {
        try {
            String currentGreeting = greeterService.getGreeting();
            return ResponseEntity.ok(Map.of("greeting", currentGreeting));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> setGreeting(@RequestBody Map<String, String> request) {
        try {
            String newGreeting = request.get("greeting");
            if (newGreeting == null || newGreeting.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "greeting field is required"));
            }

            String txHash = greeterService.setGreeting(newGreeting);
            return ResponseEntity.ok(Map.of("transaction_hash", txHash, "status", "Success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
