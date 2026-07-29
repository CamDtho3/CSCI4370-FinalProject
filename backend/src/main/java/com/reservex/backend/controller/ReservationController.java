package com.reservex.backend.controller;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.ReservationResponse;
import com.reservex.backend.entity.Reservation;
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
        return reservationService.getAllReservations().stream()
                .map(ReservationResponse::from)
                .toList();
    }


    // GET reservation by ID
    @GetMapping("/{id}")
    public ReservationResponse getReservationById(
            @PathVariable Integer id) {

        return reservationService.getReservationById(id)
                .map(ReservationResponse::from)
                .orElseThrow(() -> ApiException.notFound(
                        "NOT_FOUND", "That reservation no longer exists."));
    }


    // POST create reservation
    @PostMapping
    public ReservationResponse createReservation(
            @RequestBody Reservation reservation) {

        return ReservationResponse.from(reservationService.createReservation(reservation));
    }


    // DELETE reservation
    @DeleteMapping("/{id}")
    public void deleteReservation(
            @PathVariable Integer id) {

        reservationService.deleteReservation(id);
    }
}
