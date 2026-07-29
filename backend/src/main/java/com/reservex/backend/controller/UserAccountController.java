package com.reservex.backend.controller;

import com.reservex.backend.dto.UserAccountRequest;
import com.reservex.backend.dto.UserAccountResponse;
import com.reservex.backend.service.UserAccountService;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/users")
public class UserAccountController {


    private final UserAccountService userAccountService;


    public UserAccountController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }


    // GET all users
    @GetMapping
    public List<UserAccountResponse> getAllUsers() {
        return userAccountService.getAllUsers();
    }


    // GET user by email
    @GetMapping("/{email}")
    public UserAccountResponse getUserByEmail(
            @PathVariable String email) {

        return userAccountService.getUserResponse(email);
    }


    // CREATE user
    @PostMapping
    public UserAccountResponse createUser(
            @RequestBody UserAccountRequest user) {

        return userAccountService.createUser(user);
    }


    // DELETE user
    @DeleteMapping("/{email}")
    public void deleteUser(
            @PathVariable String email) {

        userAccountService.deleteUser(email);
    }
}
