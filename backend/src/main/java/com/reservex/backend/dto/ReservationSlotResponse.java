package com.reservex.backend.dto;

import com.reservex.backend.entity.ReservationSlot;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservationSlotResponse(
    String restPhone,
    LocalDate slotDate,
    LocalTime slotTime,
    Integer slotCapacity,
    int availableSpots) {

  /** bookedCovers is the sum of party sizes already booked into this slot. */
  public static ReservationSlotResponse from(ReservationSlot s, int bookedCovers) {
    return new ReservationSlotResponse(
        s.getRestaurant().getRestPhone(),
        s.getSlotDate(),
        s.getSlotTime(),
        s.getSlotCapacity(),
        Math.max(0, s.getSlotCapacity() - bookedCovers));
  }
}
