package com.smartbank.manager.portal;

import com.smartbank.manager.customer.CustomerResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me/profile")
public class MyProfileController {

    private final MyProfileService myProfileService;

    public MyProfileController(MyProfileService myProfileService) {
        this.myProfileService = myProfileService;
    }

    @GetMapping
    public CustomerResponse getMyProfile() {
        return myProfileService.getMyProfile();
    }

    @PutMapping
    public CustomerResponse updateMyProfile(@Valid @RequestBody MyProfileRequest request) {
        return myProfileService.updateMyProfile(request);
    }
}
