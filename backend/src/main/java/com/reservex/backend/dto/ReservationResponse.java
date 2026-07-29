package com.reservex.backend.dto;

import com.reservex.backend.entity.Reservation;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservationResponse(
    Integer resNum,
    String restPhone,
    String restName,
    String email,
    Integer partySize,
    String specialReq,
    String resStatus,
    LocalDateTime resCreated,
    LocalDate slotDate,
    LocalTime slotTime) {

  public static ReservationResponse from(Reservation r) {
    return new ReservationResponse(
        r.getResNum(),
        r.getRestaurant().getRestPhone(),
        r.getRestaurant().getRestName(),
        r.getUser().getEmail(),
        r.getPartySize(),
        r.getSpecialReq(),
        r.getResStatus(),
        r.getResCreated(),
        r.getSlotDate(),
        r.getSlotTime());
  }
}
