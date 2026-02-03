package com.example.project_01.analytics.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProjectStatResponse {
    private String projectName;
    private long completedCount;
    private long totalCount;
    private double completionRate;
    private String color; // Optional, might be handled in FE or BE
}
