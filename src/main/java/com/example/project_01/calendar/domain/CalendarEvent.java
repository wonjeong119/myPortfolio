package com.example.project_01.calendar.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "calendar_event")
public class CalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false)
    private String title;

    @Column(name = "event_type", nullable = false)
    private String type;

    @Column(name = "event_time")
    private String time;

    @Column(columnDefinition = "TEXT")
    private String memo;

    private LocalDateTime createdAt = LocalDateTime.now();

    protected CalendarEvent() {}

    public CalendarEvent(LocalDate eventDate, String title, String type, String time, String memo) {
        this.eventDate = eventDate;
        this.title = title;
        this.type = type;
        this.time = time;
        this.memo = memo;
    }

    // getters
    public Long getId() { return id; }
    public LocalDate getEventDate() { return eventDate; }
    public String getTitle() { return title; }
    public String getType() { return type; }
    public String getTime() { return time; }
    public String getMemo() { return memo; }

    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public void setTitle(String title) { this.title = title; }
    public void setType(String type) { this.type = type; }
    public void setTime(String time) { this.time = time; }
    public void setMemo(String memo) { this.memo = memo; }
}