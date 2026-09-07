package com.smartbank.manager.onboarding;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/account-requests")
@PreAuthorize("hasAnyRole('TELLER', 'MANAGER', 'ADMIN')")
public class AccountOpeningController {

    private final AccountOpeningService accountOpeningService;

    public AccountOpeningController(AccountOpeningService accountOpeningService) {
        this.accountOpeningService = accountOpeningService;
    }

    @GetMapping
    public List<AccountOpeningRequestResponse> listAllRequests() {
        return accountOpeningService.listAllRequests();
    }

    @GetMapping("/{requestId}/documents")
    public List<KycDocumentResponse> listDocuments(@PathVariable Long requestId) {
        return accountOpeningService.listDocumentsForRequest(requestId);
    }

    @GetMapping("/{requestId}/documents/{documentId}/file")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long requestId, @PathVariable Long documentId) throws IOException {
        KycDocument document = accountOpeningService.getDocumentOrThrow(documentId);
        var path = accountOpeningService.fileStorage().resolve(document.getStorageKey());
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .contentLength(Files.size(path))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(document.getOriginalFilename()).build().toString())
                .body(resource);
    }

    @PatchMapping("/{requestId}/teller-review")
    public AccountOpeningRequestResponse tellerReview(@PathVariable Long requestId, @Valid @RequestBody ReviewRequest request) {
        return accountOpeningService.tellerReview(requestId, request);
    }

    @PatchMapping("/{requestId}/manager-approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public AccountOpeningRequestResponse managerDecide(@PathVariable Long requestId, @Valid @RequestBody ReviewRequest request) {
        return accountOpeningService.managerDecide(requestId, request);
    }
}
