package com.example.project_01.analytics.controller;

import com.example.project_01.analytics.dto.*;
import com.example.project_01.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public AnalyticsSummaryResponse getSummary() {
        return analyticsService.getSummary();
    }

    @GetMapping("/daily")
    public List<ChartDataResponse> getDailyStats() {
        return analyticsService.getDailyStats();
    }

    @GetMapping("/weekly")
    public List<ChartDataResponse> getWeeklyStats() {
        return analyticsService.getWeeklyStats();
    }

    @GetMapping("/monthly")
    public List<ChartDataResponse> getMonthlyStats() {
        return analyticsService.getMonthlyStats();
    }

    @GetMapping("/projects")
    public List<ProjectStatResponse> getProjectStats() {
        return analyticsService.getProjectStats();
    }

    @GetMapping("/priorities")
    public List<PriorityStatResponse> getPriorityStats() {
        return analyticsService.getPriorityStats();
    }

    @GetMapping("/recent")
    public List<com.example.project_01.task.dto.TaskResponse> getRecentTasks() {
        return analyticsService.getRecentCompletedTasks();
    }
}
