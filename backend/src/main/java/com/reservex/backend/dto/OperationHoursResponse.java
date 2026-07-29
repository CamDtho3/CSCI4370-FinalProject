package com.reservex.backend.dto;

public record OperationHoursResponse(
        String restPhone,
        String dayOfWeek,
        String openTime,
        String closeTime,
        boolean isClosed) {
}
