package com.example.project_01.document.service;

import com.example.project_01.document.dto.DocumentRequest;
import com.example.project_01.document.dto.DocumentResponse;
import com.example.project_01.document.mapper.DocumentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DocumentService {

    private final DocumentMapper documentMapper;

    // File upload directory
    private final Path fileStorageLocation = Paths.get("upload").toAbsolutePath().normalize();

    public DocumentResponse uploadFile(Long projectId, MultipartFile file, String title, String description,
            String docType) {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Check if the file's name contains invalid characters
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            // Create directory if not exists
            if (!Files.exists(fileStorageLocation)) {
                Files.createDirectories(fileStorageLocation);
            }

            // Generate unique stored filename
            String storedFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);

            // Copy file to the target location (Replacing existing file with the same name)
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Create DB record
            DocumentResponse document = new DocumentResponse();
            document.setProjectId(projectId);
            document.setTitle(title);
            document.setDescription(description);
            document.setDocType(docType);
            document.setOriginalName(originalFileName);
            document.setStoredName(storedFileName);
            document.setFileSize(file.getSize());
            document.setMimeType(file.getContentType());

            documentMapper.insertDocument(document);

            // Return created document (with generated ID)
            return documentMapper.findById(document.getId()).orElse(document);

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByProject(Long projectId) {
        return documentMapper.findByProjectId(projectId);
    }

    public Resource loadFileAsResource(Long documentId) {
        try {
            DocumentResponse doc = documentMapper.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found with id " + documentId));

            Path filePath = this.fileStorageLocation.resolve(doc.getStoredName()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found " + doc.getStoredName());
            }
        } catch (MalformedURLException | FileNotFoundException ex) {
            throw new RuntimeException("File not found", ex);
        }
    }

    public DocumentResponse getDocument(Long id) {
        return documentMapper.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + id));
    }

    public void updateDocument(Long id, DocumentRequest request) {
        documentMapper.updateDocument(id, request);
    }

    public void deleteDocument(Long id) {
        DocumentResponse doc = documentMapper.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + id));

        // Delete file from storage
        try {
            Path filePath = this.fileStorageLocation.resolve(doc.getStoredName()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.error("Could not delete file: {}", doc.getStoredName(), ex);
            // We continue to delete DB record even if file delete fails
        }

        documentMapper.deleteDocument(id);
    }
}
