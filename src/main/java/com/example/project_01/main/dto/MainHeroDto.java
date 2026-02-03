package com.example.project_01.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MainHeroDto {
    // Chart Data
    private List<ChartData> chartData;

    // Quick Stats
    private Integer weeklyTasks; // 이번 주 작업
    private Integer weeklyTasksDiff; // 지난주 대비 (e.g. 12 - 8 = 4)
    private Integer completedTasksThisWeek; // 지난주 작업 수 (for comparison)

    private Integer remainingTasks; // 남은 작업수
    private Integer remainingTasksDiff; // 감소량

    private String trendPercentage; // 활동 추이 %

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChartData {
        private String month;
        private Integer value;
    }
}
