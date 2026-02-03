package com.example.project_01.analytics.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AnalyticsSummaryResponse {
    private long totalTasks;
    private long completedTasks;
    private long remainingTasks;
    private double completionRate;
}
