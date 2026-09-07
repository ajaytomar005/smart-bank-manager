package com.smartbank.manager.portal;

import com.smartbank.manager.account.AccountResponse;
import com.smartbank.manager.transaction.TransactionResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me/accounts")
public class MyAccountController {

    private final MyAccountService myAccountService;

    public MyAccountController(MyAccountService myAccountService) {
        this.myAccountService = myAccountService;
    }

    @GetMapping
    public List<AccountResponse> listMyAccounts() {
        return myAccountService.listMyAccounts();
    }

    @GetMapping("/{accountId}/transactions")
    public List<TransactionResponse> listMyAccountTransactions(@PathVariable Long accountId) {
        return myAccountService.listMyAccountTransactions(accountId);
    }
}
