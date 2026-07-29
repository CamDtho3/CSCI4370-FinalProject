package com.reservex.backend.controller;

import com.reservex.backend.entity.ReservationHistory;
import com.reservex.backend.entity.ReservationHistoryId;
import com.reservex.backend.service.ReservationHistoryService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservation-history")
@CrossOrigin(origins = "*")
public class ReservationHistoryController {

    private final ReservationHistoryService reservationHistoryService;


    public ReservationHistoryController(ReservationHistoryService reservationHistoryService) {
        this.reservationHistoryService = reservationHistoryService;
    }


    // GET all reservation history
    @GetMapping
    public List<ReservationHistory> getAllHistory() {
        return reservationHistoryService.getAllHistory();
    }


    // POST create reservation history record
    @PostMapping
    public ReservationHistory createHistory(
            @RequestBody ReservationHistory history) {

        return reservationHistoryService.createHistory(history);
    }


    // DELETE reservation history record
    @DeleteMapping
    public void deleteHistory(
            @RequestBody ReservationHistoryId id) {

        reservationHistoryService.deleteHistory(id);
    }
}