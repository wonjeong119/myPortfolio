package com.example.project_01.document.mapper;

import com.example.project_01.document.dto.DocumentRequest;
import com.example.project_01.document.dto.DocumentResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface DocumentMapper {
    void insertDocument(DocumentResponse document);

    List<DocumentResponse> findByProjectId(@Param("projectId") Long projectId);

    Optional<DocumentResponse> findById(@Param("id") Long id);

    void updateDocument(@Param("id") Long id, @Param("request") DocumentRequest request);

    void deleteDocument(@Param("id") Long id);
}
