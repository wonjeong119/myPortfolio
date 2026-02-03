package com.example.project_01.calendar.controller;

import com.example.project_01.calendar.dto.CalendarRequest;
import com.example.project_01.calendar.dto.CalendarResponse;
import com.example.project_01.calendar.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CalendarService service;

    // 월별 조회
    @GetMapping
    public List<CalendarResponse> getMonthly(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end) {
        return service.getMonthly(start, end);
    }

    // 일정 추가
    @PostMapping
    public void create(@RequestBody CalendarRequest request) {
        service.create(request);
    }

    // 일정 수정
    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody CalendarRequest request) {
        service.update(id, request);
    }

    // 일정삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }

}