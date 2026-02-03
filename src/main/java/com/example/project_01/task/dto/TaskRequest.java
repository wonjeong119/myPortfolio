package com.example.project_01.task.dto;

import java.time.LocalDate;

public record TaskRequest(
        String title,
        String description,
        String priority,
        LocalDate deadline,
        Boolean completed) {
}
