package com.reservex.backend.controller;

import com.reservex.backend.dto.ReservationRequest;
import com.reservex.backend.dto.ReservationResponse;
import com.reservex.backend.dto.ReservationStatusUpdateRequest;
import com.reservex.backend.service.ReservationService;
import org.springframework.web.bind.annotation.*;

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


    // GET reservation by ID
    @GetMapping("/{id}")
    public ReservationResponse getReservationById(
            @PathVariable Integer id) {

        return ReservationResponse.from(reservationService.getReservationEntity(id));
    }


    // POST create reservation — capacity-checked, writes the first history row
    @PostMapping
    public ReservationResponse createReservation(
            @RequestBody ReservationRequest reservation) {

        return reservationService.createReservation(reservation);
    }


    // PATCH change status — validated against the allowed-transition map, writes a history row
    @PatchMapping("/{id}/status")
    public ReservationResponse updateStatus(
            @PathVariable Integer id,
            @RequestBody ReservationStatusUpdateRequest update) {

        return reservationService.transitionStatus(id, update.toStatus(), update.changedByEmail());
    }


    // DELETE reservation
    @DeleteMapping("/{id}")
    public void deleteReservation(
            @PathVariable Integer id) {

        reservationService.deleteReservation(id);
    }
}
