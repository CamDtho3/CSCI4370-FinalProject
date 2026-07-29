package com.reservex.backend.controller;

import com.reservex.backend.dto.ReservationSlotResponse;
import com.reservex.backend.entity.ReservationSlot;
import com.reservex.backend.entity.ReservationSlotId;
import com.reservex.backend.service.ReservationSlotService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(
                reservationSlotService.getAllSlots().stream()
                        .map(ReservationSlotResponse::from)
                        .toList());
    }


    // CREATE reservation slot
    // POST http://localhost:8080/api/reservation-slots
    @PostMapping
    public ResponseEntity<ReservationSlotResponse> createSlot(
            @RequestBody ReservationSlot slot) {

        return ResponseEntity.ok(
                ReservationSlotResponse.from(reservationSlotService.createSlot(slot))
        );
    }


    // DELETE reservation slot
    // DELETE http://localhost:8080/api/reservation-slots
    @DeleteMapping
    public ResponseEntity<Void> deleteSlot(
            @RequestBody ReservationSlotId id) {

        reservationSlotService.deleteSlot(id);

        return ResponseEntity.noContent().build();
    }
}
