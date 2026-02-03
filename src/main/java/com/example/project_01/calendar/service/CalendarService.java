package com.example.project_01.calendar.service;

import com.example.project_01.calendar.dto.CalendarRequest;
import com.example.project_01.calendar.dto.CalendarResponse;
import com.example.project_01.calendar.mapper.CalendarMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {

    private final CalendarMapper calendarMapper;

    public List<CalendarResponse> getMonthly(LocalDate start, LocalDate end) {
        return calendarMapper.findByDateRange(start, end);
    }

    public void create(CalendarRequest request) {
        CalendarResponse event = new CalendarResponse();
        event.setDate(request.date());
        event.setTitle(request.title());
        event.setType(request.type());
        event.setTime(request.time());
        event.setMemo(request.memo());
        calendarMapper.insertEvent(event);
    }

    public void update(Long id, CalendarRequest request) {
        calendarMapper.findById(id)
                .orElseThrow(() -> new NoSuchElementException("event not found: " + id));
        calendarMapper.updateEvent(id, request);
    }

    public void delete(Long id) {
        calendarMapper.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Event not found: " + id));
        calendarMapper.deleteEvent(id);
    }
}
