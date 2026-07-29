package com.reservex.backend.dto;

import java.time.LocalTime;

public record RestaurantHoursRequest(
    String restPhone, String dayOfWeek, LocalTime openTime, LocalTime closeTime, Boolean isClosed) {
}
