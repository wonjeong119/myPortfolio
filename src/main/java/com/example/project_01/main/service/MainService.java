package com.example.project_01.main.service;

import com.example.project_01.main.dto.MainItemDto;
import com.example.project_01.main.dto.MainHeroDto;
import com.example.project_01.main.dto.MainSummaryDto;
import com.example.project_01.main.mapper.MainMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MainService {

    private final MainMapper mainMapper;

    public List<MainItemDto> getMainItems() {
        return mainMapper.selectMainItems();
    }

    public MainHeroDto getHeroData() {
        var heroStats = mainMapper.selectHeroStats();
        var chartData = mainMapper.selectChartData();
        if (heroStats != null) {
            heroStats.setChartData(chartData);
        }
        return heroStats;
    }

    public MainSummaryDto getSummaryData() {
        return mainMapper.selectSummaryStats();
    }
}
