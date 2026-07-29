package com.reservex.backend.controller;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.UserAccountResponse;
import com.reservex.backend.entity.UserAccount;
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
        return userAccountService.getAllUsers().stream()
                .map(UserAccountResponse::from)
                .toList();
    }


    // GET user by email
    @GetMapping("/{email}")
    public UserAccountResponse getUserByEmail(
            @PathVariable String email) {

        UserAccount user = userAccountService.getUserByEmail(email);
        if (user == null) {
            throw ApiException.notFound("NOT_FOUND", "That account no longer exists.");
        }
        return UserAccountResponse.from(user);
    }


    // CREATE user
    @PostMapping
    public UserAccountResponse createUser(
            @RequestBody UserAccount user) {

        return UserAccountResponse.from(userAccountService.createUser(user));
    }


    // DELETE user
    @DeleteMapping("/{email}")
    public void deleteUser(
            @PathVariable String email) {

        userAccountService.deleteUser(email);
    }
}
