package com.example.project_01.project.service;

import com.example.project_01.project.dto.ProjectRequest;
import com.example.project_01.project.dto.ProjectResponse;
import com.example.project_01.project.mapper.ProjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectMapper projectMapper;

    public List<ProjectResponse> list() {
        return projectMapper.projectsList();
    }

    public ProjectResponse detail(Long id) {
        return projectMapper.projectDetail(id);
    }

    public void create(ProjectRequest request) {
        projectMapper.projectInsert(request);
    }

    public void update(Long id, ProjectRequest request) {
        projectMapper.projectUpdate(id, request);
    }

    public void delete(Long id) {
        projectMapper.projectDelete(id);
    }
}