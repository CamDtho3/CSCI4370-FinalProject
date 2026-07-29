package com.reservex.backend.service;

import com.reservex.backend.entity.ReservationHistory;
import com.reservex.backend.entity.ReservationHistoryId;
import com.reservex.backend.repository.ReservationHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationHistoryService {

    private final ReservationHistoryRepository repository;


    public ReservationHistoryService(ReservationHistoryRepository repository) {
        this.repository = repository;
    }


    public List<ReservationHistory> getAllHistory() {
        return repository.findAll();
    }


    public ReservationHistory createHistory(ReservationHistory history) {
        return repository.save(history);
    }


    public void deleteHistory(ReservationHistoryId id) {
        repository.deleteById(id);
    }
}