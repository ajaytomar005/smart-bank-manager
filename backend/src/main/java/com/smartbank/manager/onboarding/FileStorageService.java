package com.smartbank.manager.onboarding;

import com.smartbank.manager.common.BadRequestException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores KYC documents on the local filesystem. Swap this class for an S3-backed
 * implementation later without touching callers - they only deal in storage keys.
 */
@Service
public class FileStorageService {

    private final Path baseDir;

    public FileStorageService(@Value("${app.storage.kyc-documents-dir}") String kycDocumentsDir) {
        this.baseDir = Path.of(kycDocumentsDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(baseDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create KYC document storage directory", e);
        }
    }

    public String store(Long customerId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        String safeName = UUID.randomUUID() + "-" + sanitize(file.getOriginalFilename());
        Path customerDir = baseDir.resolve(String.valueOf(customerId)).normalize();
        if (!customerDir.startsWith(baseDir)) {
            throw new BadRequestException("Invalid customer path");
        }
        try {
            Files.createDirectories(customerDir);
            Path target = customerDir.resolve(safeName);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return baseDir.relativize(target).toString();
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store uploaded file", e);
        }
    }

    public Path resolve(String storageKey) {
        Path resolved = baseDir.resolve(storageKey).normalize();
        if (!resolved.startsWith(baseDir)) {
            throw new BadRequestException("Invalid storage key");
        }
        return resolved;
    }

    private String sanitize(String filename) {
        if (filename == null || filename.isBlank()) {
            return "file";
        }
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
