package com.reservex.backend.service;

import com.reservex.backend.entity.UserAccount;
import com.reservex.backend.repository.UserAccountRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserAccountService {

    private final UserAccountRepository userAccountRepository;


    public UserAccountService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }


    // GET all users
    public List<UserAccount> getAllUsers() {
        return userAccountRepository.findAll();
    }


    // GET user by email
    public UserAccount getUserByEmail(String email) {
        return userAccountRepository.findById(email)
                .orElse(null);
    }


    // CREATE user
    public UserAccount createUser(UserAccount user) {
        return userAccountRepository.save(user);
    }


    // DELETE user
    public void deleteUser(String email) {
        userAccountRepository.deleteById(email);
    }
}