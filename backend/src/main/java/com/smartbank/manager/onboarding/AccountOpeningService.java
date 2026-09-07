package com.smartbank.manager.onboarding;

import com.smartbank.manager.account.Account;
import com.smartbank.manager.account.AccountRepository;
import com.smartbank.manager.audit.AuditService;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.common.ResourceNotFoundException;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.employee.Employee;
import com.smartbank.manager.security.CurrentUserProvider;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AccountOpeningService {

    private final AccountOpeningRequestRepository requestRepository;
    private final KycDocumentRepository documentRepository;
    private final AccountRepository accountRepository;
    private final FileStorageService fileStorageService;
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public AccountOpeningService(
            AccountOpeningRequestRepository requestRepository,
            KycDocumentRepository documentRepository,
            AccountRepository accountRepository,
            FileStorageService fileStorageService,
            AuditService auditService,
            CurrentUserProvider currentUserProvider) {
        this.requestRepository = requestRepository;
        this.documentRepository = documentRepository;
        this.accountRepository = accountRepository;
        this.fileStorageService = fileStorageService;
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    // ---- Customer-facing ----

    public List<AccountOpeningRequestResponse> listMyRequests() {
        Long customerId = currentUserProvider.getCurrentCustomer().getCustomerId();
        return requestRepository.findByCustomerCustomerId(customerId).stream()
                .map(AccountOpeningRequestResponse::from)
                .toList();
    }

    @Transactional
    public AccountOpeningRequestResponse createRequest(AccountOpeningRequestCreateRequest dto) {
        Customer customer = currentUserProvider.getCurrentCustomer();

        AccountOpeningRequest request = new AccountOpeningRequest();
        request.setCustomer(customer);
        request.setAccountType(dto.accountType());
        request.setInitialDeposit(dto.initialDeposit() == null ? java.math.BigDecimal.ZERO : dto.initialDeposit());
        request.setStatus(AccountRequestStatus.PENDING);
        request = requestRepository.save(request);

        auditService.recordCustomerAction(customer, "REQUEST_ACCOUNT_OPENING", "AccountOpeningRequest#" + request.getRequestId());
        return AccountOpeningRequestResponse.from(request);
    }

    @Transactional
    public KycDocumentResponse uploadMyDocument(Long requestId, KycDocumentType documentType, MultipartFile file) {
        Customer customer = currentUserProvider.getCurrentCustomer();
        AccountOpeningRequest request = findOwnRequestOrThrow(requestId, customer.getCustomerId());
        if (request.getStatus() == AccountRequestStatus.APPROVED || request.getStatus() == AccountRequestStatus.REJECTED) {
            throw new BadRequestException("This request has already been decided; documents can no longer be added");
        }

        String storageKey = fileStorageService.store(customer.getCustomerId(), file);

        KycDocument document = new KycDocument();
        document.setRequest(request);
        document.setCustomer(customer);
        document.setDocumentType(documentType);
        document.setOriginalFilename(file.getOriginalFilename());
        document.setStorageKey(storageKey);
        document.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        document.setSizeBytes(file.getSize());
        document = documentRepository.save(document);

        auditService.recordCustomerAction(customer, "UPLOAD_KYC_DOCUMENT", "KycDocument#" + document.getDocumentId());
        return KycDocumentResponse.from(document);
    }

    public List<KycDocumentResponse> listMyDocuments(Long requestId) {
        Customer customer = currentUserProvider.getCurrentCustomer();
        findOwnRequestOrThrow(requestId, customer.getCustomerId());
        return documentRepository.findByRequestRequestId(requestId).stream().map(KycDocumentResponse::from).toList();
    }

    private AccountOpeningRequest findOwnRequestOrThrow(Long requestId, Long customerId) {
        AccountOpeningRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Account opening request not found: " + requestId));
        if (!request.getCustomer().getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("Account opening request not found: " + requestId);
        }
        return request;
    }

    // ---- Staff-facing ----

    public List<AccountOpeningRequestResponse> listAllRequests() {
        return requestRepository.findAllWithDetails().stream().map(AccountOpeningRequestResponse::from).toList();
    }

    public List<KycDocumentResponse> listDocumentsForRequest(Long requestId) {
        return documentRepository.findByRequestRequestId(requestId).stream().map(KycDocumentResponse::from).toList();
    }

    public KycDocument getDocumentOrThrow(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
    }

    public FileStorageService fileStorage() {
        return fileStorageService;
    }

    @Transactional
    public AccountOpeningRequestResponse tellerReview(Long requestId, ReviewRequest dto) {
        AccountOpeningRequest request = findRequestOrThrow(requestId);
        if (request.getStatus() != AccountRequestStatus.PENDING) {
            throw new BadRequestException("This request has already been reviewed by a teller");
        }

        Employee employee = currentUserProvider.getCurrentEmployee();
        request.setTellerReviewedBy(employee);
        request.setTellerReviewedAt(Instant.now());
        request.setTellerNotes(dto.notes());
        request.setStatus(dto.decision() == ReviewDecision.APPROVE ? AccountRequestStatus.TELLER_APPROVED : AccountRequestStatus.REJECTED);
        request = requestRepository.save(request);

        auditService.record(employee, "TELLER_REVIEW_ACCOUNT_REQUEST", "AccountOpeningRequest#" + request.getRequestId());
        return AccountOpeningRequestResponse.from(request);
    }

    @Transactional
    public AccountOpeningRequestResponse managerDecide(Long requestId, ReviewRequest dto) {
        AccountOpeningRequest request = findRequestOrThrow(requestId);
        if (request.getStatus() != AccountRequestStatus.TELLER_APPROVED) {
            throw new BadRequestException("This request must be teller-approved before a manager can decide");
        }

        Employee employee = currentUserProvider.getCurrentEmployee();
        request.setManagerDecidedBy(employee);
        request.setManagerDecidedAt(Instant.now());
        request.setManagerNotes(dto.notes());

        if (dto.decision() == ReviewDecision.APPROVE) {
            Account account = new Account();
            account.setCustomer(request.getCustomer());
            account.setAccountType(request.getAccountType());
            account.setBalance(request.getInitialDeposit());
            account = accountRepository.save(account);

            request.setCreatedAccount(account);
            request.setStatus(AccountRequestStatus.APPROVED);
            auditService.record(employee, "APPROVE_ACCOUNT_OPENING", "Account#" + account.getAccountId());
        } else {
            request.setStatus(AccountRequestStatus.REJECTED);
            auditService.record(employee, "REJECT_ACCOUNT_OPENING", "AccountOpeningRequest#" + request.getRequestId());
        }

        request = requestRepository.save(request);
        return AccountOpeningRequestResponse.from(request);
    }

    private AccountOpeningRequest findRequestOrThrow(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Account opening request not found: " + requestId));
    }
}
