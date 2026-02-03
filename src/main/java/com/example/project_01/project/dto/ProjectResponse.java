package com.example.project_01.project.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class ProjectResponse {
    private Long id;
    private String name;
    private String category;
    private String priority;
    private String status;
    private LocalDate deadline;
    private String description;
    private Integer progress;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public ProjectResponse() {
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }


    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public String getDescription() {
        return description;
    }


    public Integer getProgress() {
        return progress;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

}
