package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.ReservationRequest;
import com.reservex.backend.dto.ReservationResponse;
import com.reservex.backend.entity.Reservation;
import com.reservex.backend.entity.ReservationHistory;
import com.reservex.backend.entity.Restaurant;
import com.reservex.backend.entity.UserAccount;
import com.reservex.backend.repository.ReservationHistoryRepository;
import com.reservex.backend.repository.ReservationRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {

    private static final List<String> INACTIVE_STATUSES = List.of("CANCELLED", "NO_SHOW");

    /** Which statuses each status may move to. Terminal states map to an empty set. */
    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            "PENDING", Set.of("CONFIRMED", "CANCELLED"),
            "CONFIRMED", Set.of("SEATED", "NO_SHOW", "CANCELLED"),
            "SEATED", Set.of("COMPLETED"),
            "COMPLETED", Set.of(),
            "CANCELLED", Set.of(),
            "NO_SHOW", Set.of());

    private final ReservationRepository reservationRepository;
    private final ReservationHistoryRepository reservationHistoryRepository;
    private final RestaurantService restaurantService;
    private final UserAccountService userAccountService;
    private final ReservationSlotService reservationSlotService;


    public ReservationService(
            ReservationRepository reservationRepository,
            ReservationHistoryRepository reservationHistoryRepository,
            RestaurantService restaurantService,
            UserAccountService userAccountService,
            ReservationSlotService reservationSlotService) {

        this.reservationRepository = reservationRepository;
        this.reservationHistoryRepository = reservationHistoryRepository;
        this.restaurantService = restaurantService;
        this.userAccountService = userAccountService;
        this.reservationSlotService = reservationSlotService;
    }


    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(ReservationResponse::from)
                .toList();
    }

    public List<ReservationResponse> getReservationsByRestaurantAndDate(
            String restPhone,
            LocalDate slotDate) {
        return reservationRepository
                .findByRestaurant_RestPhoneAndSlotDateOrderBySlotTimeAsc(restPhone, slotDate)
                .stream()
                .map(ReservationResponse::from)
                .toList();
    }


    public Reservation getReservationEntity(Integer resNum) {
        return reservationRepository.findById(resNum)
                .orElseThrow(() -> ApiException.notFound("NOT_FOUND", "That reservation no longer exists."));
    }


    /**
     * Creates a reservation, or throws SLOT_FULL if the party won't fit.
     * Writes the reservation and its first ReservationHistory row in one
     * transaction — a status change with no audit trail is exactly what
     * that table exists to prevent.
     */
    @Transactional
    public ReservationResponse createReservation(ReservationRequest req) {
        Restaurant restaurant = restaurantService.getRestaurantEntity(req.restPhone());
        UserAccount diner = userAccountService.getUserEntity(req.email());
        var slot = reservationSlotService.getSlotEntity(req.restPhone(), req.slotDate(), req.slotTime());

        int alreadyBooked = reservationRepository.sumPartySizeForSlot(
                req.restPhone(), req.slotDate(), req.slotTime(), INACTIVE_STATUSES);
        int remaining = slot.getSlotCapacity() - alreadyBooked;

        if (req.partySize() > remaining) {
            String message = remaining > 0
                    ? "Only " + remaining + (remaining == 1 ? " seat" : " seats") + " remain at this time."
                    : "That time just filled up.";
            throw ApiException.conflict("SLOT_FULL", message);
        }

        Reservation reservation = new Reservation();
        reservation.setRestaurant(restaurant);
        reservation.setUser(diner);
        reservation.setSlotDate(req.slotDate());
        reservation.setSlotTime(req.slotTime());
        reservation.setPartySize(req.partySize());
        reservation.setSpecialReq(req.specialReq());
        reservation.setResStatus("CONFIRMED");
        reservation.setResCreated(LocalDateTime.now());

        Reservation saved = reservationRepository.save(reservation);
        writeHistory(saved, "CONFIRMED", diner);

        return ReservationResponse.from(saved);
    }


    /**
     * Moves a reservation to a new status and appends the audit row, in one
     * transaction. Mirrors ALLOWED_TRANSITIONS from the frontend's staff mock.
     */
    @Transactional
    public ReservationResponse transitionStatus(Integer resNum, String toStatus, String changedByEmail) {
        Reservation reservation = getReservationEntity(resNum);
        UserAccount changedBy = userAccountService.getUserEntity(changedByEmail);

        Set<String> allowed = ALLOWED_TRANSITIONS.getOrDefault(reservation.getResStatus(), Set.of());
        if (!allowed.contains(toStatus)) {
            throw ApiException.conflict(
                    "INVALID_TRANSITION",
                    "A " + reservation.getResStatus().toLowerCase()
                            + " booking cannot become " + toStatus.toLowerCase() + ".");
        }

        reservation.setResStatus(toStatus);
        Reservation saved = reservationRepository.save(reservation);
        writeHistory(saved, toStatus, changedBy);

        return ReservationResponse.from(saved);
    }


    public void deleteReservation(Integer id) {
        getReservationEntity(id); // 404 if missing
        reservationRepository.deleteById(id);
    }


    private void writeHistory(Reservation reservation, String status, UserAccount changedBy) {
        ReservationHistory history = new ReservationHistory();
        history.setReservation(reservation);
        history.setChangedAt(LocalDateTime.now());
        history.setChangedTo(status);
        history.setChangedBy(changedBy);
        reservationHistoryRepository.save(history);
    }
}
