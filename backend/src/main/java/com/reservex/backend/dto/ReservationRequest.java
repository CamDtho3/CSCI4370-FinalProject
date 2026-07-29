package com.reservex.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * {@code email} identifies the diner. Stands in for the authenticated
 * principal until a real session/auth mechanism exists — see the auth
 * flow item on the backend punch list.
 */
public record ReservationRequest(
    String restPhone,
    String email,
    LocalDate slotDate,
    LocalTime slotTime,
    Integer partySize,
    String specialReq) {
}
