package com.example.project_01.calendar.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CalendarResponse {

    private Long id;
    private LocalDate date;
    private String title;
    private String type;
    private String time;
    private String memo;

}