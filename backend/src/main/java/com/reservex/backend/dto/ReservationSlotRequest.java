package com.reservex.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationSlotRequest(
    @NotBlank String restPhone,
    @NotNull LocalDate slotDate,
    @NotNull LocalTime slotTime,
    @NotNull @Min(0) Integer slotCapacity) {
}
