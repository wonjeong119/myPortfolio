package com.example.project_01.calendar.service;

import com.example.project_01.calendar.domain.CalendarEvent;
import com.example.project_01.calendar.dto.CalendarCreateRequest;
import com.example.project_01.calendar.repository.CalendarRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import java.util.NoSuchElementException;


@Service
public class CalendarService {

    private final CalendarRepository calendarRepository;

    public CalendarService(CalendarRepository repository) {
        this.calendarRepository = repository;
    }

    public List<CalendarEvent> getMonthly(LocalDate start, LocalDate end) {
        return calendarRepository.findByEventDateBetween(start, end);
    }

    public void create(CalendarCreateRequest request) {
        CalendarEvent event = new CalendarEvent(
                request.getDate(),
                request.getTitle(),
                request.getType(),
                request.getTime(),
                request.getMemo()
        );
        calendarRepository.save(event);
    }
    @Transactional
    public void update(Long id, CalendarCreateRequest request) {
        CalendarEvent event = calendarRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("event not found: " + id));

        event.setEventDate(request.getDate());   // req.getDate() 형태면 그에 맞게
        event.setTitle(request.getTitle());
        event.setType(request.getType());
        event.setTime(request.getTime());
        event.setMemo(request.getMemo());

        // JPA 영속 상태면 save 안 해도 되지만, 명시적으로 해도 됨
        calendarRepository.save(event);
    }

    @Transactional
    public void delete(Long id) {
        if (!calendarRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found: " + id);
        }
        calendarRepository.deleteById(id);
    }
}