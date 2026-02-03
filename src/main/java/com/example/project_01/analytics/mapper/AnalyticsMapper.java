package com.example.project_01.analytics.mapper;

import com.example.project_01.analytics.dto.ChartDataResponse;
import com.example.project_01.analytics.dto.PriorityStatResponse;
import com.example.project_01.analytics.dto.ProjectStatResponse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AnalyticsMapper {
    long countTotalTasks();

    long countCompletedTasks();

    // Returns completed tasks count grouped by day for the last 7 days
    List<ChartDataResponse> findDailyCompletedStats();

    // Returns completed tasks count grouped by week for the last 8 weeks
    List<ChartDataResponse> findWeeklyCompletedStats();

    // Returns completed tasks count grouped by month for the current year
    List<ChartDataResponse> findMonthlyCompletedStats();

    // Returns completion stats per project
    List<ProjectStatResponse> findProjectCompletionStats();

    // Returns completion stats per priority
    List<PriorityStatResponse> findPriorityCompletionStats();

    // Returns recently completed tasks
    List<com.example.project_01.task.dto.TaskResponse> findRecentCompletedTasks(
            @org.apache.ibatis.annotations.Param("limit") int limit);
}
