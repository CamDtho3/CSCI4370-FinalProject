package com.reservex.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReservationHistoryRequest(
    @NotNull Integer resNum,
    @NotBlank String changedTo,
    @NotBlank @Email String changedByEmail) {
}
