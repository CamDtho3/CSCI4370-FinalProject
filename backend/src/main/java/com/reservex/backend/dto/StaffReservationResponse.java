package com.reservex.backend.dto;

import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.ReservationHistory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * What staff see for a reservation — deliberately a different shape from
 * ReservationResponse: it carries the guest's identity and full status
 * history, which a diner has no business receiving about anyone else's
 * booking.
 */
public record StaffReservationResponse(
    Integer resNum,
    String restPhone,
    String restName,
    Integer partySize,
    String specialReq,
    String resStatus,
    LocalDateTime resCreated,
    LocalDate slotDate,
    LocalTime slotTime,
    String dinerName,
    String dinerEmail,
    String dinerPhone,
    List<HistoryEntry> history) {

  public record HistoryEntry(LocalDateTime changedAt, String changedTo, String changedBy) {

    public static HistoryEntry from(ReservationHistory h) {
      return new HistoryEntry(h.getChangedAt(), h.getChangedTo(), h.getChangedBy().getEmail());
    }
  }

  public static StaffReservationResponse from(Reservation r, List<ReservationHistory> history) {
    var diner = r.getUser();
    return new StaffReservationResponse(
        r.getResNum(),
        r.getRestaurant().getRestPhone(),
        r.getRestaurant().getRestName(),
        r.getPartySize(),
        r.getSpecialReq(),
        r.getResStatus(),
        r.getResCreated(),
        r.getSlotDate(),
        r.getSlotTime(),
        (diner.getFname() + " " + diner.getLname()).trim(),
        diner.getEmail(),
        diner.getUserPhone(),
        history.stream().map(HistoryEntry::from).toList());
  }
}
