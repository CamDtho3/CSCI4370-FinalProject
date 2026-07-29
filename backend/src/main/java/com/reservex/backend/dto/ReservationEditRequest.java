package com.reservex.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Party size, slot, and special request only — the restaurant and the
 * diner are fixed on an existing reservation; changing either would be
 * a different reservation rather than an edit.
 */
public record ReservationEditRequest(
    @NotNull LocalDate slotDate,
    @NotNull LocalTime slotTime,
    @NotNull @Min(1) Integer partySize,
    String specialReq) {
}
