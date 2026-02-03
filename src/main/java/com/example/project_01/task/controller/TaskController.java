package com.example.project_01.task.controller;

import com.example.project_01.task.dto.TaskRequest;
import com.example.project_01.task.dto.TaskResponse;
import com.example.project_01.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    // 전체 작업 조회 (프론드엔드 fetchAllTasks 대응)
    @GetMapping("/tasks")
    public List<TaskResponse> getAllTasks() {
        return taskService.getAllTasks();
    }

    // 최근 완료된 작업 조회 (알림용 - DB 시간 기준 3일 이내)
    @GetMapping("/tasks/recent-completed")
    public List<TaskResponse> getRecentCompletedTasks() {
        return taskService.getRecentCompletedTasks();
    }

    // 특정 프로젝트의 작업 목록 조회
    @GetMapping("/projects/{projectId}/tasks")
    public List<TaskResponse> getTasksByProject(@PathVariable Long projectId) {
        return taskService.getTasksByProjectId(projectId);
    }

    // 작업 생성
    @PostMapping("/projects/{projectId}/tasks")
    public TaskResponse create(@PathVariable Long projectId, @RequestBody TaskRequest request) {
        return taskService.createTask(projectId, request);
    }

    // 작업 상세 (필요시)
    @GetMapping("/projects/{projectId}/tasks/{taskId}")
    public TaskResponse getTask(@PathVariable Long projectId, @PathVariable Long taskId) {
        return taskService.getTask(projectId, taskId);
    }

    // 작업 수정
    @PutMapping("/projects/{projectId}/tasks/{taskId}")
    public TaskResponse update(@PathVariable Long projectId, @PathVariable Long taskId,
            @RequestBody TaskRequest request) {
        return taskService.updateTask(projectId, taskId, request);
    }

    // 작업 삭제
    @DeleteMapping("/projects/{projectId}/tasks/{taskId}")
    public void delete(@PathVariable Long projectId, @PathVariable Long taskId) {
        taskService.deleteTask(projectId, taskId);
    }

    // 작업 완료 여부 토글
    @PatchMapping("/projects/{projectId}/tasks/{taskId}/toggle")
    public TaskResponse toggle(@PathVariable Long projectId, @PathVariable Long taskId) {
        return taskService.toggleTask(projectId, taskId);
    }
}
