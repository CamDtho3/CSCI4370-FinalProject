package com.reservex.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationSlotRequest(
    String restPhone, LocalDate slotDate, LocalTime slotTime, Integer slotCapacity) {
}
