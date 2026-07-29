package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.ReservationHistoryRequest;
import com.reservex.backend.dto.ReservationHistoryResponse;
import com.reservex.backend.entity.ReservationHistory;
import com.reservex.backend.entity.ReservationHistoryId;
import com.reservex.backend.repository.ReservationHistoryRepository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ReservationHistoryService {

    private final ReservationHistoryRepository repository;
    private final ReservationService reservationService;
    private final UserAccountService userAccountService;


    public ReservationHistoryService(
            ReservationHistoryRepository repository,
            ReservationService reservationService,
            UserAccountService userAccountService) {

        this.repository = repository;
        this.reservationService = reservationService;
        this.userAccountService = userAccountService;
    }


    public List<ReservationHistoryResponse> getAllHistory() {
        return repository.findAll().stream()
                .map(ReservationHistoryResponse::from)
                .toList();
    }


    /**
     * Manual/administrative entry point. The normal path — a reservation's
     * own create and status-transition calls — writes its history row
     * automatically inside the same transaction; see ReservationService.
     */
    public ReservationHistoryResponse createHistory(ReservationHistoryRequest req) {
        ReservationHistory history = new ReservationHistory();
        history.setReservation(reservationService.getReservationEntity(req.resNum()));
        history.setChangedAt(LocalDateTime.now());
        history.setChangedTo(req.changedTo());
        history.setChangedBy(userAccountService.getUserEntity(req.changedByEmail()));

        return ReservationHistoryResponse.from(repository.save(history));
    }


    public void deleteHistory(ReservationHistoryId id) {
        repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("NOT_FOUND", "That history entry no longer exists."));
        repository.deleteById(id);
    }
}
