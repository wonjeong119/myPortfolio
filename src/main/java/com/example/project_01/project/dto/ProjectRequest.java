package com.example.project_01.project.dto;
import java.time.LocalDate;

public record ProjectRequest(
        String name,
        String category,
        String priority,
        String status,
        LocalDate deadline,
        String description,
        Integer progress
) {}