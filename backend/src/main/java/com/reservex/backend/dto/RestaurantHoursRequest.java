package com.reservex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalTime;

public record RestaurantHoursRequest(
    @NotBlank String restPhone,
    @NotBlank String dayOfWeek,
    LocalTime openTime,
    LocalTime closeTime,
    Boolean isClosed) {
}
