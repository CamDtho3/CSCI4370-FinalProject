package com.reservex.backend.controller;

import com.reservex.backend.common.auth.AuthSession;
import com.reservex.backend.dto.ReservationEditRequest;
import com.reservex.backend.dto.ReservationRequest;
import com.reservex.backend.dto.ReservationResponse;
import com.reservex.backend.dto.ReservationStatusUpdateRequest;
import com.reservex.backend.dto.StaffReservationResponse;
import com.reservex.backend.service.ReservationService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;


    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }


    // GET the signed-in diner's own reservations
    @GetMapping
    public List<ReservationResponse> getMyReservations(HttpSession session) {
        return reservationService.getReservationsForDiner(AuthSession.requireEmail(session));
    }

    // GET reservations by restaurant phone and date — staff at that restaurant only
    @GetMapping("/restaurant/{restPhone}")
    public List<ReservationResponse> getReservationsByRestaurantAndDate(
            @PathVariable String restPhone,
            @RequestParam LocalDate slotDate,
            HttpSession session) {

        return reservationService.getReservationsByRestaurantAndDate(
                restPhone, slotDate, AuthSession.requireEmail(session));
    }


    // GET reservations by restaurant phone and date, staff-shaped (guest identity + history)
    // — staff at that restaurant only, carries diner names/emails/phones
    @GetMapping("/restaurant/{restPhone}/staff")
    public List<StaffReservationResponse> getStaffReservationsByRestaurantAndDate(
            @PathVariable String restPhone,
            @RequestParam LocalDate slotDate,
            HttpSession session) {

        return reservationService.getStaffReservationsForRestaurantAndDate(
                restPhone, slotDate, AuthSession.requireEmail(session));
    }


    // GET reservation by ID — the diner who booked it, or staff at that restaurant
    @GetMapping("/{id}")
    public ReservationResponse getReservationById(
            @PathVariable Integer id,
            HttpSession session) {

        return reservationService.getReservationForUser(id, AuthSession.requireEmail(session));
    }


    // POST create reservation — capacity-checked, writes the first history row
    @PostMapping
    public ReservationResponse createReservation(
            @Valid @RequestBody ReservationRequest reservation,
            HttpSession session) {

        return reservationService.createReservation(reservation, AuthSession.requireEmail(session));
    }


    // PATCH change status — validated against the allowed-transition map, writes a history row
    @PatchMapping("/{id}/status")
    public ReservationResponse updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody ReservationStatusUpdateRequest update,
            HttpSession session) {

        return reservationService.transitionStatus(id, update.toStatus(), AuthSession.requireEmail(session));
    }


    // PATCH edit party size/slot/special request — capacity-checked, no history row
    @PatchMapping("/{id}")
    public ReservationResponse updateReservation(
            @PathVariable Integer id,
            @Valid @RequestBody ReservationEditRequest edit,
            HttpSession session) {

        return reservationService.updateReservation(id, edit, AuthSession.requireEmail(session));
    }


    // DELETE reservation — the diner who booked it, or staff at that restaurant
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(
            @PathVariable Integer id,
            HttpSession session) {

        reservationService.deleteReservation(id, AuthSession.requireEmail(session));
        return ResponseEntity.noContent().build();
    }
}
