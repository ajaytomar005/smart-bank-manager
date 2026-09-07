package com.smartbank.manager.portal;

import com.smartbank.manager.dispute.DisputeResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me/disputes")
public class MyDisputeController {

    private final MyDisputeService myDisputeService;

    public MyDisputeController(MyDisputeService myDisputeService) {
        this.myDisputeService = myDisputeService;
    }

    @GetMapping
    public List<DisputeResponse> listMyDisputes() {
        return myDisputeService.listMyDisputes();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DisputeResponse raiseDispute(@Valid @RequestBody MyDisputeRequest request) {
        return myDisputeService.raiseDispute(request);
    }
}
