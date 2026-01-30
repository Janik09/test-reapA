package com.example.restaurantapp.auth;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String VALID_USERNAME = "Janik Gierer";
    private static final String VALID_PASSWORD = "123456";
    private static final String CHEF_USERNAME = "Koch";
    private static final String CHEF_PASSWORD = "Pizza1";
    private static final String WAITER_USERNAME = "Kellner";
    private static final String WAITER_PASSWORD = "Service1";

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        if (request == null
                || request.getUsername() == null
                || request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "error"));
        }
        String username = request.getUsername().trim();
        String password = request.getPassword();
        boolean isChef = CHEF_USERNAME.equalsIgnoreCase(username)
                && CHEF_PASSWORD.equals(password);
        if (isChef) {
            return ResponseEntity.ok(Map.of("status", "success", "role", "chef"));
        }
        boolean isWaiter = WAITER_USERNAME.equalsIgnoreCase(username)
                && WAITER_PASSWORD.equals(password);
        if (isWaiter) {
            return ResponseEntity.ok(Map.of("status", "success", "role", "waiter"));
        }
        boolean matches = VALID_USERNAME.equals(username)
                && VALID_PASSWORD.equals(password);
        if (matches) {
            return ResponseEntity.ok(Map.of("status", "success", "role", "customer"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("status", "error"));
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
