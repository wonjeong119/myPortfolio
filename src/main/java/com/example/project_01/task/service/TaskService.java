package com.example.project_01.task.service;

import com.example.project_01.task.dto.TaskRequest;
import com.example.project_01.task.dto.TaskResponse;
import com.example.project_01.task.mapper.TaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskMapper taskMapper;

    public List<TaskResponse> getAllTasks() {
        return taskMapper.findAll();
    }

    public List<TaskResponse> getRecentCompletedTasks() {
        return taskMapper.findRecentCompletedTasks();
    }

    public List<TaskResponse> getTasksByProjectId(Long projectId) {
        return taskMapper.findByProjectId(projectId);
    }

    public TaskResponse getTask(Long projectId, Long taskId) {
        return taskMapper.findByPk(projectId, taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public TaskResponse createTask(Long projectId, TaskRequest request) {
        // ID Generation Logic using project_task_seq
        Long nextTaskId = taskMapper.getNextTaskIdForUpdate(projectId);
        Long currentTaskId;

        if (nextTaskId == null) {
            currentTaskId = 1L;
            taskMapper.insertInitialTaskSeq(projectId);
        } else {
            currentTaskId = nextTaskId;
            taskMapper.updateTaskSeq(projectId, nextTaskId + 1);
        }

        TaskResponse task = new TaskResponse();
        task.setProjectId(projectId);
        task.setTaskId(currentTaskId);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setDeadline(request.deadline());
        task.setCompleted(request.completed() != null ? request.completed() : false);

        taskMapper.insertTask(task);
        return taskMapper.findByPk(projectId, currentTaskId).orElse(task);
    }

    public TaskResponse updateTask(Long projectId, Long taskId, TaskRequest request) {
        taskMapper.updateTask(projectId, taskId, request);
        return getTask(projectId, taskId);
    }

    public void deleteTask(Long projectId, Long taskId) {
        taskMapper.deleteTask(projectId, taskId);
    }

    public TaskResponse toggleTask(Long projectId, Long taskId) {
        taskMapper.toggleTaskStatus(projectId, taskId);
        return getTask(projectId, taskId);
    }
}
