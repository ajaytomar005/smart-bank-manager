package com.smartbank.manager.account;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public List<AccountResponse> listAccounts() {
        return accountService.listAccounts();
    }

    @GetMapping("/{accountId}")
    public AccountResponse getAccount(@PathVariable Long accountId) {
        return accountService.getAccount(accountId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MANAGER', 'TELLER', 'ADMIN')")
    public AccountResponse openAccount(@Valid @RequestBody AccountRequest request) {
        return accountService.openAccount(request);
    }

    @PatchMapping("/{accountId}/freeze")
    @PreAuthorize("hasRole('MANAGER')")
    public AccountResponse freeze(@PathVariable Long accountId) {
        return accountService.freeze(accountId);
    }

    @PatchMapping("/{accountId}/unfreeze")
    @PreAuthorize("hasRole('MANAGER')")
    public AccountResponse unfreeze(@PathVariable Long accountId) {
        return accountService.unfreeze(accountId);
    }
}
