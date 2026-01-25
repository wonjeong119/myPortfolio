package com.example.project_01.calendar.dto;

import java.time.LocalDate;

public class CalendarCreateRequest {

    private LocalDate date;
    private String title;
    private String type;
    private String time;
    private String memo;

    public LocalDate getDate() { return date; }
    public String getTitle() { return title; }
    public String getType() { return type; }
    public String getTime() { return time; }
    public String getMemo() { return memo; }
}