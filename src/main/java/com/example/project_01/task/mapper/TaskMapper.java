package com.example.project_01.task.mapper;

import com.example.project_01.task.dto.TaskRequest;
import com.example.project_01.task.dto.TaskResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TaskMapper {
    // Sequence management
    Long getNextTaskIdForUpdate(Long projectId);

    void insertInitialTaskSeq(Long projectId);

    void updateTaskSeq(@Param("projectId") Long projectId, @Param("nextTaskId") Long nextTaskId);

    // Task CRUD
    List<TaskResponse> findAll();

    List<TaskResponse> findRecentCompletedTasks();

    List<TaskResponse> findByProjectId(Long projectId);

    Optional<TaskResponse> findByPk(@Param("projectId") Long projectId, @Param("taskId") Long taskId);

    void insertTask(TaskResponse task);

    void updateTask(@Param("projectId") Long projectId, @Param("taskId") Long taskId,
            @Param("request") TaskRequest request);

    void deleteTask(@Param("projectId") Long projectId, @Param("taskId") Long taskId);

    void toggleTaskStatus(@Param("projectId") Long projectId, @Param("taskId") Long taskId);
}
