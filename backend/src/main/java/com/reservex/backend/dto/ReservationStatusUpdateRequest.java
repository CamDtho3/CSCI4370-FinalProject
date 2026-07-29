package com.reservex.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** {@code changedByEmail} stands in for the authenticated principal — see ReservationRequest. */
public record ReservationStatusUpdateRequest(
    @NotBlank String toStatus,
    @NotBlank @Email String changedByEmail) {
}
