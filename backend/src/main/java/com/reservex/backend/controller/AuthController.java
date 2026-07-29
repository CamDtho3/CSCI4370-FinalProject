package com.reservex.backend.controller;

import com.reservex.backend.common.auth.AuthSession;
import com.reservex.backend.dto.LoginRequest;
import com.reservex.backend.dto.UserAccountRequest;
import com.reservex.backend.dto.UserAccountResponse;
import com.reservex.backend.entity.UserAccount;
import com.reservex.backend.service.UserAccountService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserAccountService userAccountService;


    public AuthController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }


    @PostMapping("/login")
    public UserAccountResponse login(@Valid @RequestBody LoginRequest req, HttpSession session) {
        UserAccount user = userAccountService.authenticate(req.email(), req.password());
        AuthSession.login(session, user.getEmail());
        return UserAccountResponse.from(user);
    }


    @PostMapping("/signup")
    public UserAccountResponse signup(@Valid @RequestBody UserAccountRequest req, HttpSession session) {
        UserAccountResponse created = userAccountService.createUser(req);
        AuthSession.login(session, created.email());
        return created;
    }


    @GetMapping("/me")
    public UserAccountResponse me(HttpSession session) {
        return userAccountService.getUserResponse(AuthSession.requireEmail(session));
    }


    @PostMapping("/logout")
    public void logout(HttpSession session) {
        AuthSession.logout(session);
    }
}
