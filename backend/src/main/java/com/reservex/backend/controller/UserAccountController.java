package com.reservex.backend.controller;

import com.reservex.backend.common.auth.AuthSession;
import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.UserAccountRequest;
import com.reservex.backend.dto.UserAccountResponse;
import com.reservex.backend.service.UserAccountService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/users")
public class UserAccountController {


    private final UserAccountService userAccountService;


    public UserAccountController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }


    // GET all users — signed in only; there is no admin role to scope this further yet
    @GetMapping
    public List<UserAccountResponse> getAllUsers(HttpSession session) {
        AuthSession.requireEmail(session);
        return userAccountService.getAllUsers();
    }


    // GET user by email — signed in only
    @GetMapping("/{email}")
    public UserAccountResponse getUserByEmail(
            @PathVariable String email,
            HttpSession session) {

        AuthSession.requireEmail(session);
        return userAccountService.getUserResponse(email);
    }


    // CREATE user
    @PostMapping
    public UserAccountResponse createUser(
            @Valid @RequestBody UserAccountRequest user) {

        return userAccountService.createUser(user);
    }


    // DELETE user — self-service only; no admin role exists to delete on someone's behalf
    @DeleteMapping("/{email}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable String email,
            HttpSession session) {

        if (!AuthSession.requireEmail(session).equals(email)) {
            throw ApiException.forbidden("FORBIDDEN", "You can only delete your own account.");
        }
        userAccountService.deleteUser(email);
        return ResponseEntity.noContent().build();
    }
}
