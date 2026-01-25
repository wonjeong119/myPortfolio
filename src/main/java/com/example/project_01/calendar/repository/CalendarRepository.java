package com.example.project_01.calendar.repository;

import com.example.project_01.calendar.domain.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CalendarRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findByEventDateBetween(LocalDate start, LocalDate end);
}