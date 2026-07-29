package com.reservex.backend.controller;

import com.reservex.backend.dto.ReservationHistoryResponse;
import com.reservex.backend.entity.ReservationHistory;
import com.reservex.backend.entity.ReservationHistoryId;
import com.reservex.backend.service.ReservationHistoryService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservation-history")
public class ReservationHistoryController {

    private final ReservationHistoryService reservationHistoryService;


    public ReservationHistoryController(ReservationHistoryService reservationHistoryService) {
        this.reservationHistoryService = reservationHistoryService;
    }


    // GET all reservation history
    @GetMapping
    public List<ReservationHistoryResponse> getAllHistory() {
        return reservationHistoryService.getAllHistory().stream()
                .map(ReservationHistoryResponse::from)
                .toList();
    }


    // POST create reservation history record
    @PostMapping
    public ReservationHistoryResponse createHistory(
            @RequestBody ReservationHistory history) {

        return ReservationHistoryResponse.from(reservationHistoryService.createHistory(history));
    }


    // DELETE reservation history record
    @DeleteMapping
    public void deleteHistory(
            @RequestBody ReservationHistoryId id) {

        reservationHistoryService.deleteHistory(id);
    }
}
