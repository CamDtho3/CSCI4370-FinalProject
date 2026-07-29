package com.reservex.backend.dto;

/** {@code password} is plaintext from the client — hashed by the service, never stored as-is. */
public record UserAccountRequest(
    String email,
    String password,
    String userRole,
    String fname,
    String lname,
    String userPhone,
    String employerPhone) {
}
