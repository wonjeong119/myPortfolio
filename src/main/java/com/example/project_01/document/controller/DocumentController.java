package com.example.project_01.document.controller;

import com.example.project_01.document.dto.DocumentRequest;
import com.example.project_01.document.dto.DocumentResponse;
import com.example.project_01.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    // 문서 목록 조회
    @GetMapping("/projects/{projectId}/documents")
    public List<DocumentResponse> getDocuments(@PathVariable Long projectId) {
        return documentService.getDocumentsByProject(projectId);
    }

    // 문서 업로드
    @PostMapping("/projects/{projectId}/documents")
    public DocumentResponse uploadDocument(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("docType") String docType) {
        return documentService.uploadFile(projectId, file, title, description, docType);
    }

    // 문서 메타데이터 수정
    @PutMapping("/documents/{documentId}")
    public void updateDocument(
            @PathVariable Long documentId,
            @RequestBody DocumentRequest request) {
        documentService.updateDocument(documentId, request);
    }

    // 문서 삭제
    @DeleteMapping("/documents/{documentId}")
    public void deleteDocument(@PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
    }

    // 파일 다운로드
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long documentId) {
        Resource resource = documentService.loadFileAsResource(documentId);
        DocumentResponse doc = documentService.getDocument(documentId);

        // 한글 파일명 처리
        String encodedFileName = URLEncoder.encode(doc.getOriginalName(), StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .body(resource);
    }
}
