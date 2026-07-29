package com.reservex.backend.controller;

import com.reservex.backend.entity.UserAccount;
import com.reservex.backend.service.UserAccountService;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserAccountController {


    private final UserAccountService userAccountService;


    public UserAccountController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }


    // GET all users
    @GetMapping
    public List<UserAccount> getAllUsers() {
        return userAccountService.getAllUsers();
    }


    // GET user by email
    @GetMapping("/{email}")
    public UserAccount getUserByEmail(
            @PathVariable String email) {

        return userAccountService.getUserByEmail(email);
    }


    // CREATE user
    @PostMapping
    public UserAccount createUser(
            @RequestBody UserAccount user) {

        return userAccountService.createUser(user);
    }


    // DELETE user
    @DeleteMapping("/{email}")
    public void deleteUser(
            @PathVariable String email) {

        userAccountService.deleteUser(email);
    }
}