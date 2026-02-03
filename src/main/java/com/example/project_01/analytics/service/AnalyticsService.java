package com.example.project_01.analytics.service;

import com.example.project_01.analytics.dto.*;
import com.example.project_01.analytics.mapper.AnalyticsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AnalyticsMapper analyticsMapper;

    public AnalyticsSummaryResponse getSummary() {
        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse();
        long total = analyticsMapper.countTotalTasks();
        long completed = analyticsMapper.countCompletedTasks();

        summary.setTotalTasks(total);
        summary.setCompletedTasks(completed);
        summary.setRemainingTasks(total - completed);

        double rate = total == 0 ? 0 : (double) completed / total * 100;
        summary.setCompletionRate(Math.round(rate * 10.0) / 10.0);

        return summary;
    }

    public List<ChartDataResponse> getDailyStats() {
        return analyticsMapper.findDailyCompletedStats();
    }

    public List<ChartDataResponse> getWeeklyStats() {
        return analyticsMapper.findWeeklyCompletedStats();
    }

    public List<ChartDataResponse> getMonthlyStats() {
        return analyticsMapper.findMonthlyCompletedStats();
    }

    public List<ProjectStatResponse> getProjectStats() {
        List<ProjectStatResponse> stats = analyticsMapper.findProjectCompletionStats();
        stats.forEach(s -> {
            double rate = s.getTotalCount() == 0 ? 0 : (double) s.getCompletedCount() / s.getTotalCount() * 100;
            s.setCompletionRate(Math.round(rate * 10.0) / 10.0);
        });
        return stats;
    }

    public List<PriorityStatResponse> getPriorityStats() {
        return analyticsMapper.findPriorityCompletionStats();
    }

    public List<com.example.project_01.task.dto.TaskResponse> getRecentCompletedTasks() {
        return analyticsMapper.findRecentCompletedTasks(5); // Limit 5
    }
}
