package com.reservex.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewRequest(
    @NotBlank @Email String email,
    @NotBlank String restPhone,
    @NotNull @Min(1) @Max(5) Integer rating,
    String comment) {
}
