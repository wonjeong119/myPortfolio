package com.example.project_01.document.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
public class DocumentResponse {
    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private String docType; // spec, design, guide, api, other
    private String originalName; // original_name
    private String storedName; // stored_name
    private Long fileSize;
    private String mimeType;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
