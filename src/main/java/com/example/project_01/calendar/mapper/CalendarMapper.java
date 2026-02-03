package com.example.project_01.calendar.mapper;

import com.example.project_01.calendar.dto.CalendarRequest;
import com.example.project_01.calendar.dto.CalendarResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Mapper
public interface CalendarMapper {
    List<CalendarResponse> findByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    Optional<CalendarResponse> findById(Long id);

    void insertEvent(CalendarResponse event);

    void updateEvent(@Param("id") Long id, @Param("request") CalendarRequest request);

    void deleteEvent(Long id);
}
