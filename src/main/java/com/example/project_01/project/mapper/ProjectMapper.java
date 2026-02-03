package com.example.project_01.project.mapper;
import com.example.project_01.project.dto.ProjectRequest;
import com.example.project_01.project.dto.ProjectResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
@Mapper
public interface ProjectMapper {
    List<ProjectResponse> projectsList();
    ProjectResponse projectDetail(@Param("id") Long id);
    int projectInsert(ProjectRequest request);
    int projectUpdate(@Param("id") Long id, @Param("request") ProjectRequest request);
    int projectDelete(@Param("id") Long id);
}
