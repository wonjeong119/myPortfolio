package com.example.project_01.analytics.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PriorityStatResponse {
    private String priority; // High, Medium, Low
    private long count;
}
