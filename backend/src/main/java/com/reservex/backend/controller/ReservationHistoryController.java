package com.reservex.backend.controller;

import com.reservex.backend.common.auth.AuthSession;
import com.reservex.backend.dto.ReservationHistoryRequest;
import com.reservex.backend.dto.ReservationHistoryResponse;
import com.reservex.backend.entity.ReservationHistoryId;
import com.reservex.backend.service.ReservationHistoryService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservation-history")
public class ReservationHistoryController {

    private final ReservationHistoryService reservationHistoryService;


    public ReservationHistoryController(ReservationHistoryService reservationHistoryService) {
        this.reservationHistoryService = reservationHistoryService;
    }


    // GET all reservation history — staff only
    @GetMapping
    public List<ReservationHistoryResponse> getAllHistory(HttpSession session) {
        return reservationHistoryService.getAllHistory(AuthSession.requireEmail(session));
    }


    // POST create reservation history record — owner or staff at that restaurant
    @PostMapping
    public ReservationHistoryResponse createHistory(
            @Valid @RequestBody ReservationHistoryRequest history,
            HttpSession session) {

        return reservationHistoryService.createHistory(history, AuthSession.requireEmail(session));
    }


    // DELETE reservation history record — staff at that restaurant only
    @DeleteMapping
    public ResponseEntity<Void> deleteHistory(
            @RequestBody ReservationHistoryId id,
            HttpSession session) {

        reservationHistoryService.deleteHistory(id, AuthSession.requireEmail(session));
        return ResponseEntity.noContent().build();
    }
}
