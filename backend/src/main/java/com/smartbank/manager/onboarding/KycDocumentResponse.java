package com.smartbank.manager.onboarding;

import java.time.Instant;

public record KycDocumentResponse(
        Long documentId,
        Long requestId,
        KycDocumentType documentType,
        String originalFilename,
        String contentType,
        long sizeBytes,
        Instant uploadedAt
) {
    public static KycDocumentResponse from(KycDocument d) {
        return new KycDocumentResponse(
                d.getDocumentId(),
                d.getRequest().getRequestId(),
                d.getDocumentType(),
                d.getOriginalFilename(),
                d.getContentType(),
                d.getSizeBytes(),
                d.getUploadedAt());
    }
}
