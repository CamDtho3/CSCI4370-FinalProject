package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.ReservationHistoryRequest;
import com.reservex.backend.dto.ReservationHistoryResponse;
import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.ReservationHistory;
import com.reservex.backend.entity.ReservationHistoryId;
import com.reservex.backend.entity.UserAccount;
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


    /** System-wide audit view — staff only; there's no single restaurant to scope it to. */
    public List<ReservationHistoryResponse> getAllHistory(String actingEmail) {
        userAccountService.requireStaff(actingEmail);

        return repository.findAll().stream()
                .map(ReservationHistoryResponse::from)
                .toList();
    }


    /**
     * Manual/administrative entry point. The normal path — a reservation's
     * own create and status-transition calls — writes its history row
     * automatically inside the same transaction; see ReservationService.
     * Same "owner or staff at this restaurant" rule as touching the
     * reservation itself.
     */
    public ReservationHistoryResponse createHistory(ReservationHistoryRequest req, String actingEmail) {
        UserAccount actingUser = reservationService.requireCanManage(req.resNum(), actingEmail);

        ReservationHistory history = new ReservationHistory();
        history.setReservation(reservationService.getReservationEntity(req.resNum()));
        history.setChangedAt(LocalDateTime.now());
        history.setChangedTo(req.changedTo());
        history.setChangedBy(actingUser);

        return ReservationHistoryResponse.from(repository.save(history));
    }


    /** Staff at the reservation's restaurant only — an audit trail isn't diners' to erase. */
    public void deleteHistory(ReservationHistoryId id, String actingEmail) {
        ReservationHistory history = repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("NOT_FOUND", "That history entry no longer exists."));

        Reservation reservation = history.getReservation();
        userAccountService.requireStaffAt(actingEmail, reservation.getRestaurant().getRestPhone());

        repository.deleteById(id);
    }
}
