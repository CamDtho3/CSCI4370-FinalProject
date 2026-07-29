package com.reservex.backend.controller;

import com.reservex.backend.dto.ReservationEditRequest;
import com.reservex.backend.dto.ReservationRequest;
import com.reservex.backend.dto.ReservationResponse;
import com.reservex.backend.dto.ReservationStatusUpdateRequest;
import com.reservex.backend.dto.StaffReservationResponse;
import com.reservex.backend.service.ReservationService;

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


    // GET all reservations
    @GetMapping
    public List<ReservationResponse> getAllReservations() {
        return reservationService.getAllReservations();
    }

    // GET reservations by restaurant phone and date
    @GetMapping("/restaurant/{restPhone}")
    public List<ReservationResponse> getReservationsByRestaurantAndDate(
            @PathVariable String restPhone,
            @RequestParam LocalDate slotDate) {

        return reservationService.getReservationsByRestaurantAndDate(restPhone, slotDate);
    }


    // GET reservations by restaurant phone and date, staff-shaped (guest identity + history)
    @GetMapping("/restaurant/{restPhone}/staff")
    public List<StaffReservationResponse> getStaffReservationsByRestaurantAndDate(
            @PathVariable String restPhone,
            @RequestParam LocalDate slotDate) {

        return reservationService.getStaffReservationsForRestaurantAndDate(restPhone, slotDate);
    }


    // GET reservation by ID
    @GetMapping("/{id}")
    public ReservationResponse getReservationById(
            @PathVariable Integer id) {

        return ReservationResponse.from(reservationService.getReservationEntity(id));
    }


    // POST create reservation — capacity-checked, writes the first history row
    @PostMapping
    public ReservationResponse createReservation(
            @Valid @RequestBody ReservationRequest reservation) {

        return reservationService.createReservation(reservation);
    }


    // PATCH change status — validated against the allowed-transition map, writes a history row
    @PatchMapping("/{id}/status")
    public ReservationResponse updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody ReservationStatusUpdateRequest update) {

        return reservationService.transitionStatus(id, update.toStatus(), update.changedByEmail());
    }


    // PATCH edit party size/slot/special request — capacity-checked, no history row
    @PatchMapping("/{id}")
    public ReservationResponse updateReservation(
            @PathVariable Integer id,
            @Valid @RequestBody ReservationEditRequest edit) {

        return reservationService.updateReservation(id, edit);
    }


    // DELETE reservation
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(
            @PathVariable Integer id) {

        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
