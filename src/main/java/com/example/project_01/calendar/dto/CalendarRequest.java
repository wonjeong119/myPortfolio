package com.example.project_01.calendar.dto;

import java.time.LocalDate;

public record CalendarRequest(
        LocalDate date,
        String title,
        String type,
        String time,
        String memo) {
}
