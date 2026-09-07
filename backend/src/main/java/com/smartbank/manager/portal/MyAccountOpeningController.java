package com.smartbank.manager.portal;

import com.smartbank.manager.onboarding.AccountOpeningRequestCreateRequest;
import com.smartbank.manager.onboarding.AccountOpeningRequestResponse;
import com.smartbank.manager.onboarding.AccountOpeningService;
import com.smartbank.manager.onboarding.KycDocumentResponse;
import com.smartbank.manager.onboarding.KycDocumentType;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/me/account-requests")
public class MyAccountOpeningController {

    private final AccountOpeningService accountOpeningService;

    public MyAccountOpeningController(AccountOpeningService accountOpeningService) {
        this.accountOpeningService = accountOpeningService;
    }

    @GetMapping
    public List<AccountOpeningRequestResponse> listMyRequests() {
        return accountOpeningService.listMyRequests();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountOpeningRequestResponse createRequest(@Valid @RequestBody AccountOpeningRequestCreateRequest request) {
        return accountOpeningService.createRequest(request);
    }

    @GetMapping("/{requestId}/documents")
    public List<KycDocumentResponse> listMyDocuments(@PathVariable Long requestId) {
        return accountOpeningService.listMyDocuments(requestId);
    }

    @PostMapping("/{requestId}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public KycDocumentResponse uploadDocument(
            @PathVariable Long requestId,
            @RequestParam KycDocumentType documentType,
            @RequestPart MultipartFile file) {
        return accountOpeningService.uploadMyDocument(requestId, documentType, file);
    }
}
