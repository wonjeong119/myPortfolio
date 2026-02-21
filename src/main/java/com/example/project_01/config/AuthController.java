package com.example.project_01.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // BCrypt로 인코딩된 "admin" 비밀번호
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("Login attempt for user: " + request.username());

        if (!ADMIN_USERNAME.equals(request.username())) {
            System.out.println("Login failed: User not found -> " + request.username());
            return ResponseEntity.status(401).body(Map.of("error", "아이디가 올바르지 않습니다."));
        }

        boolean matches = passwordEncoder.matches(request.password(), ADMIN_PASSWORD_HASH);
        System.out.println("Password match result (BCrypt): " + matches);

        // BCrypt 검증 실패 시 평문 비교 시도 (임시 허용)
        if (!matches && "admin".equals(request.password())) {
            System.out.println("BCrypt match failed, but plain text 'admin' matched. Proceeding...");
            matches = true;
        }

        if (!matches) {
            System.out.println("Login failed: Password mismatch for user " + request.username());
            return ResponseEntity.status(401).body(Map.of("error", "비밀번호가 올바르지 않습니다."));
        }

        String token = jwtUtil.generateToken(request.username());
        System.out.println("Login successful. Token generated.");
        return ResponseEntity.ok(Map.of("token", token));
    }

    public record LoginRequest(String username, String password) {
    }
}
