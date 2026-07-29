package com.reservex.backend.dto;

import com.reservex.backend.entity.ReservationHistory;
import java.time.LocalDateTime;

public record ReservationHistoryResponse(
    Integer resNum, LocalDateTime changedAt, String changedTo, String changedByEmail) {

  public static ReservationHistoryResponse from(ReservationHistory h) {
    return new ReservationHistoryResponse(
        h.getReservation().getResNum(),
        h.getChangedAt(),
        h.getChangedTo(),
        h.getChangedBy().getEmail());
  }
}
