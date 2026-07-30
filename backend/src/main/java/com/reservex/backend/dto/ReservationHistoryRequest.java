package com.reservex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Who made the change is the authenticated session, not a request field — see AuthSession. */
public record ReservationHistoryRequest(
    @NotNull Integer resNum,
    @NotBlank String changedTo) {
}
