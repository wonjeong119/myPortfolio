package com.example.project_01.project.controller;
import com.example.project_01.project.dto.ProjectRequest;
import com.example.project_01.project.dto.ProjectResponse;
import com.example.project_01.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects")

public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<ProjectResponse> list() {
        return projectService.list();
        //return List.of(); // 빈 배열이라도 200 OK로 내려감
    }

    @GetMapping("/{id}")
    public ProjectResponse detail(@PathVariable Long id) {
        return projectService.detail(id);
    }

    @PostMapping
    public void create(@RequestBody ProjectRequest request) {
        projectService.create(request);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody ProjectRequest request) {
        projectService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        projectService.delete(id);
    }
}