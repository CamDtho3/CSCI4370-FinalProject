package com.reservex.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record RestaurantRequest(
    @NotBlank String restPhone,
    @NotBlank String restName,
    String street,
    String zip,
    String city,
    String state,
    String cuisine,
    @Min(1) @Max(4) Integer priceRange,
    String imageUrl) {
}
