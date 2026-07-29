package com.reservex.backend.dto;

import jakarta.validation.constraints.NotBlank;

/** Who's making the change is the authenticated session, not a request field — see AuthSession. */
public record ReservationStatusUpdateRequest(@NotBlank String toStatus) {
}
