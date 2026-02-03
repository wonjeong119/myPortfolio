package com.example.project_01.main.controller;

import com.example.project_01.main.dto.MainItemDto;
import com.example.project_01.main.dto.MainHeroDto;
import com.example.project_01.main.dto.MainSummaryDto;
import com.example.project_01.main.service.MainService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main")
public class MainController {

    private final MainService mainService;

    @GetMapping("/items")
    public List<MainItemDto> getMainItems() {
        return mainService.getMainItems();
    }

    @GetMapping("/hero")
    public MainHeroDto getHeroData() {
        return mainService.getHeroData();
    }

    @GetMapping("/summary")
    public MainSummaryDto getSummaryData() {
        return mainService.getSummaryData();
    }
}
