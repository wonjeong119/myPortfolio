package com.example.project_01.calendar.dto;

import com.example.project_01.calendar.domain.CalendarEvent;
import java.time.LocalDate;

public class CalendarResponse {

    private Long id;
    private LocalDate date;
    private String title;
    private String type;
    private String time;
    private String memo;

    public CalendarResponse(CalendarEvent event) {
        this.id = event.getId();
        this.date = event.getEventDate();
        this.title = event.getTitle();
        this.type = event.getType();
        this.time = event.getTime();
        this.memo = event.getMemo();
    }

    // getters
    public Long getId() { return id; }
    public LocalDate getDate() { return date; }
    public String getTitle() { return title; }
    public String getType() { return type; }
    public String getTime() { return time; }
    public String getMemo() { return memo; }
}