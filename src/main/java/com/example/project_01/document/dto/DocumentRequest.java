package com.example.project_01.document.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DocumentRequest {
    private String title;
    private String description;
    private String docType;
}
