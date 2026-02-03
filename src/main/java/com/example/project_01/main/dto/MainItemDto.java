package com.example.project_01.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MainItemDto {
    private Long id;
    private String name;
    private String category;
    private String status;
    private String assignee;
    private Integer progress;
    private LocalDate dueDate;
    private String priority;
}
