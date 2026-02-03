package com.example.project_01.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MainSummaryDto {
    // Card 1: 진행 중인 프로젝트
    private String ongoingProjectsValue;
    private String ongoingProjectsTrend;
    private String ongoingProjectsDesc;

    // Card 2: 이번 달 완료한 프로젝트
    private String completedProjectsValue;
    private String completedProjectsTrend;
    private String completedProjectsDesc;

    // Card 3: 완료한 작업
    private String completedTasksValue;
    private String completedTasksTrend;
    private String completedTasksDesc;

    // Card 4: 남은 작업
    private String remainingTasksValue;
    private String remainingTasksDesc;
    private String remainingTasksTrend;
}
