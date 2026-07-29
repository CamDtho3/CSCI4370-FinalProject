package com.reservex.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** {@code password} is plaintext from the client — hashed by the service, never stored as-is. */
public record UserAccountRequest(
    @NotBlank @Email String email,
    @NotBlank String password,
    @NotBlank String userRole,
    @NotBlank String fname,
    @NotBlank String lname,
    String userPhone,
    String employerPhone) {
}
