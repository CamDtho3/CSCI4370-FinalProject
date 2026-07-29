package com.reservex.backend.dto;

import com.reservex.backend.entity.ReservationSlot;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationSlotResponse(
    String restPhone, LocalDate slotDate, LocalTime slotTime, Integer slotCapacity) {

  public static ReservationSlotResponse from(ReservationSlot s) {
    return new ReservationSlotResponse(
        s.getRestaurant().getRestPhone(), s.getSlotDate(), s.getSlotTime(), s.getSlotCapacity());
  }
}
