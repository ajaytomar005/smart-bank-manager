package com.smartbank.manager.report;

import com.smartbank.manager.account.Account;
import com.smartbank.manager.account.AccountRepository;
import com.smartbank.manager.common.BadRequestException;
import com.smartbank.manager.customer.Customer;
import com.smartbank.manager.customer.CustomerRepository;
import com.smartbank.manager.loan.Loan;
import com.smartbank.manager.loan.LoanRepository;
import com.smartbank.manager.transaction.Transaction;
import com.smartbank.manager.transaction.TransactionRepository;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final LoanRepository loanRepository;
    private final TransactionRepository transactionRepository;

    public ReportService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            LoanRepository loanRepository,
            TransactionRepository transactionRepository) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.loanRepository = loanRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public byte[] exportExcel(ReportType type) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            switch (type) {
                case CUSTOMERS -> writeCustomers(workbook);
                case ACCOUNTS -> writeAccounts(workbook);
                case LOANS -> writeLoans(workbook);
                case TRANSACTIONS -> writeTransactions(workbook);
                default -> throw new BadRequestException("Unsupported report type: " + type);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private void writeCustomers(XSSFWorkbook workbook) {
        List<Customer> customers = customerRepository.findAll();
        Sheet sheet = createSheet(workbook, "Customers", "ID", "Name", "Email", "Phone", "KYC Status", "Segment", "Created At");
        int rowNum = 1;
        for (Customer c : customers) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(c.getCustomerId());
            row.createCell(1).setCellValue(c.getName());
            row.createCell(2).setCellValue(c.getEmail());
            row.createCell(3).setCellValue(c.getPhone());
            row.createCell(4).setCellValue(c.getKycStatus().name());
            row.createCell(5).setCellValue(c.getSegment() == null ? "" : c.getSegment());
            row.createCell(6).setCellValue(c.getCreatedAt().toString());
        }
    }

    private void writeAccounts(XSSFWorkbook workbook) {
        List<Account> accounts = accountRepository.findAll();
        Sheet sheet = createSheet(workbook, "Accounts", "ID", "Customer ID", "Type", "Balance", "Status", "Opened At");
        int rowNum = 1;
        for (Account a : accounts) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(a.getAccountId());
            row.createCell(1).setCellValue(a.getCustomer().getCustomerId());
            row.createCell(2).setCellValue(a.getAccountType().name());
            row.createCell(3).setCellValue(a.getBalance().doubleValue());
            row.createCell(4).setCellValue(a.getStatus().name());
            row.createCell(5).setCellValue(a.getOpenedAt().toString());
        }
    }

    private void writeLoans(XSSFWorkbook workbook) {
        List<Loan> loans = loanRepository.findAll();
        Sheet sheet = createSheet(
                workbook, "Loans", "ID", "Customer ID", "Amount", "Interest Rate", "Credit Score", "Risk Flag", "Status", "Term (months)");
        int rowNum = 1;
        for (Loan l : loans) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(l.getLoanId());
            row.createCell(1).setCellValue(l.getCustomer().getCustomerId());
            row.createCell(2).setCellValue(l.getAmount().doubleValue());
            row.createCell(3).setCellValue(l.getInterestRate().doubleValue());
            row.createCell(4).setCellValue(l.getCreditScore() == null ? 0 : l.getCreditScore());
            row.createCell(5).setCellValue(l.getRiskFlag() == null ? "" : l.getRiskFlag().name());
            row.createCell(6).setCellValue(l.getStatus().name());
            row.createCell(7).setCellValue(l.getTermMonths());
        }
    }

    private void writeTransactions(XSSFWorkbook workbook) {
        List<Transaction> transactions = transactionRepository.findAll();
        Sheet sheet = createSheet(workbook, "Transactions", "ID", "Account ID", "Type", "Amount", "Status", "Time");
        int rowNum = 1;
        for (Transaction t : transactions) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(t.getTxnId());
            row.createCell(1).setCellValue(t.getAccount().getAccountId());
            row.createCell(2).setCellValue(t.getType().name());
            row.createCell(3).setCellValue(t.getAmount().doubleValue());
            row.createCell(4).setCellValue(t.getStatus().name());
            row.createCell(5).setCellValue(t.getTxnTime().toString());
        }
    }

    private Sheet createSheet(XSSFWorkbook workbook, String name, String... headers) {
        Sheet sheet = workbook.createSheet(name);
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        return sheet;
    }
}
