package com.reservex.backend.controller;

import com.reservex.backend.entity.Reservation;
import com.reservex.backend.service.ReservationService;
import org.springframework.http.ResponseEntity;
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
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }


    // GET reservation by ID
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(
            @PathVariable Integer id) {

        return reservationService.getReservationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // POST create reservation
    @PostMapping
    public Reservation createReservation(
            @RequestBody Reservation reservation) {

        return reservationService.createReservation(reservation);
    }


    // DELETE reservation
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(
            @PathVariable Integer id) {

        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}