package com.reservex.backend.controller;

import com.reservex.backend.common.auth.AuthSession;
import com.reservex.backend.dto.ReservationSlotRequest;
import com.reservex.backend.dto.ReservationSlotResponse;
import com.reservex.backend.entity.ReservationSlotId;
import com.reservex.backend.service.ReservationSlotService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservation-slots")
public class ReservationSlotController {

    private final ReservationSlotService reservationSlotService;


    public ReservationSlotController(ReservationSlotService reservationSlotService) {
        this.reservationSlotService = reservationSlotService;
    }


    // GET all reservation slots
    // GET http://localhost:8080/api/reservation-slots
    @GetMapping
    public ResponseEntity<List<ReservationSlotResponse>> getAllSlots() {
        return ResponseEntity.ok(reservationSlotService.getAllSlots());
    }


    // GET the slots for one restaurant on one date
    // GET http://localhost:8080/api/reservation-slots/restaurant/{restPhone}?slotDate=2026-07-29
    @GetMapping("/restaurant/{restPhone}")
    public ResponseEntity<List<ReservationSlotResponse>> getSlotsForRestaurantAndDate(
            @PathVariable String restPhone,
            @RequestParam LocalDate slotDate) {

        return ResponseEntity.ok(
                reservationSlotService.getSlotsForRestaurantAndDate(restPhone, slotDate));
    }


    // CREATE reservation slot — staff at the target restaurant only
    // POST http://localhost:8080/api/reservation-slots
    @PostMapping
    public ResponseEntity<ReservationSlotResponse> createSlot(
            @Valid @RequestBody ReservationSlotRequest slot,
            HttpSession session) {

        return ResponseEntity.ok(
                reservationSlotService.createSlot(slot, AuthSession.requireEmail(session))
        );
    }


    // DELETE reservation slot
    // DELETE http://localhost:8080/api/reservation-slots
    @DeleteMapping
    public ResponseEntity<Void> deleteSlot(
            @RequestBody ReservationSlotId id,
            HttpSession session) {

        reservationSlotService.deleteSlot(id, AuthSession.requireEmail(session));

        return ResponseEntity.noContent().build();
    }
}
