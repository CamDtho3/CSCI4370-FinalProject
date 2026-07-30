package com.reservex.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** The reviewer is the authenticated session, not a request field — see AuthSession. */
public record ReviewRequest(
    @NotBlank String restPhone,
    @NotNull @Min(1) @Max(5) Integer rating,
    String comment) {
}
