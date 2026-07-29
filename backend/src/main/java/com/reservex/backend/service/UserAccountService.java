package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.UserAccountRequest;
import com.reservex.backend.dto.UserAccountResponse;
import com.reservex.backend.entity.UserAccount;
import com.reservex.backend.repository.UserAccountRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserAccountService {

    private static final Set<String> VALID_ROLES = Set.of("DINER", "STAFF");

    private final UserAccountRepository userAccountRepository;
    private final RestaurantService restaurantService;
    private final PasswordEncoder passwordEncoder;


    public UserAccountService(
            UserAccountRepository userAccountRepository,
            RestaurantService restaurantService,
            PasswordEncoder passwordEncoder) {

        this.userAccountRepository = userAccountRepository;
        this.restaurantService = restaurantService;
        this.passwordEncoder = passwordEncoder;
    }


    // GET all users
    public List<UserAccountResponse> getAllUsers() {
        return userAccountRepository.findAll().stream()
                .map(UserAccountResponse::from)
                .toList();
    }


    // GET user by email
    public UserAccountResponse getUserResponse(String email) {
        return UserAccountResponse.from(getUserEntity(email));
    }


    /** For other services resolving the FK reference — not exposed over HTTP directly. */
    public UserAccount getUserEntity(String email) {
        return userAccountRepository.findById(email)
                .orElseThrow(() -> ApiException.notFound(
                        "NOT_FOUND", "That account no longer exists."));
    }


    // CREATE user
    public UserAccountResponse createUser(UserAccountRequest req) {
        if (!VALID_ROLES.contains(req.userRole())) {
            throw ApiException.badRequest("INVALID_ROLE", "userRole must be DINER or STAFF.");
        }

        boolean hasEmployer = req.employerPhone() != null && !req.employerPhone().isBlank();
        if (hasEmployer && !"STAFF".equals(req.userRole())) {
            throw ApiException.badRequest("INVALID_EMPLOYER", "Only STAFF accounts can have an employer.");
        }

        UserAccount user = new UserAccount();
        user.setEmail(req.email());
        user.setPwdHash(passwordEncoder.encode(req.password()));
        user.setUserRole(req.userRole());
        user.setFname(req.fname());
        user.setLname(req.lname());
        user.setUserPhone(req.userPhone());
        user.setAcctCreated(LocalDateTime.now());
        if (hasEmployer) {
            user.setEmployer(restaurantService.getRestaurantEntity(req.employerPhone()));
        }

        return UserAccountResponse.from(userAccountRepository.save(user));
    }


    // DELETE user
    public void deleteUser(String email) {
        getUserEntity(email); // 404 if missing
        userAccountRepository.deleteById(email);
    }
}
