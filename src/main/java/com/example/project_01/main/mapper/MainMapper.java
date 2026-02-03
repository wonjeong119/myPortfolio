package com.example.project_01.main.mapper;

import com.example.project_01.main.dto.MainHeroDto;
import com.example.project_01.main.dto.MainSummaryDto;
import com.example.project_01.main.dto.MainItemDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MainMapper {
    List<MainItemDto> selectMainItems();

    // Hero
    List<MainHeroDto.ChartData> selectChartData();

    MainHeroDto selectHeroStats();

    // Summary
    MainSummaryDto selectSummaryStats();
}
