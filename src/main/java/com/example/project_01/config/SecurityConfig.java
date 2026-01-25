package com.example.project_01.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable()) // 프론트에서 POST 할 거면 개발 단계에서는 끄는 게 편함
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll()   // ✅ 여기 중요
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}