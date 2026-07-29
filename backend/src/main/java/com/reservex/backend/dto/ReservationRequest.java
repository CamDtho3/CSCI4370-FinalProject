package com.reservex.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * {@code email} identifies the diner. Stands in for the authenticated
 * principal until a real session/auth mechanism exists — see the auth
 * flow item on the backend punch list.
 */
public record ReservationRequest(
    @NotBlank String restPhone,
    @NotBlank @Email String email,
    @NotNull LocalDate slotDate,
    @NotNull LocalTime slotTime,
    @NotNull @Min(1) Integer partySize,
    String specialReq) {
}
