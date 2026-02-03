package com.example.project_01.task.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class TaskResponse {
    private Long projectId;
    private Long taskId;
    private String title;
    private String description;
    private Boolean completed;
    private String priority;
    private LocalDate deadline;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
