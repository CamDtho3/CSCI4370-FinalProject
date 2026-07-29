package com.reservex.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/** The diner is the authenticated session, not a request field — see AuthSession. */
public record ReservationRequest(
    @NotBlank String restPhone,
    @NotNull LocalDate slotDate,
    @NotNull LocalTime slotTime,
    @NotNull @Min(1) Integer partySize,
    String specialReq) {
}
