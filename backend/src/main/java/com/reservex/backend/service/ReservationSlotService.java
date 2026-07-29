package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.ReservationSlotRequest;
import com.reservex.backend.dto.ReservationSlotResponse;
import com.reservex.backend.entity.ReservationSlot;
import com.reservex.backend.entity.ReservationSlotId;
import com.reservex.backend.repository.ReservationRepository;
import com.reservex.backend.repository.ReservationSlotRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ReservationSlotService {

    private static final List<String> INACTIVE_STATUSES = List.of("CANCELLED", "NO_SHOW");

    private final ReservationSlotRepository reservationSlotRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantService restaurantService;


    public ReservationSlotService(
            ReservationSlotRepository reservationSlotRepository,
            ReservationRepository reservationRepository,
            RestaurantService restaurantService) {

        this.reservationSlotRepository = reservationSlotRepository;
        this.reservationRepository = reservationRepository;
        this.restaurantService = restaurantService;
    }


    // GET all reservation slots
    public List<ReservationSlotResponse> getAllSlots() {
        return reservationSlotRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }


    // GET the slots for one restaurant on one date, in time order
    public List<ReservationSlotResponse> getSlotsForRestaurantAndDate(String restPhone, LocalDate slotDate) {
        return reservationSlotRepository
                .findByRestaurant_RestPhoneAndSlotDateOrderBySlotTimeAsc(restPhone, slotDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // GET one reservation slot
    public ReservationSlot getSlotEntity(ReservationSlotId id) {
        return reservationSlotRepository.findById(id)
                .orElseThrow(() ->
                    ApiException.notFound("NOT_FOUND", "That reservation slot no longer exists."));
    }


    /** For other services resolving the slot by its natural coordinates. */
    public ReservationSlot getSlotEntity(String restPhone, LocalDate slotDate, LocalTime slotTime) {
        return reservationSlotRepository
                .findByRestaurant_RestPhoneAndSlotDateAndSlotTime(restPhone, slotDate, slotTime)
                .orElseThrow(() -> ApiException.notFound("NOT_FOUND", "That time is no longer offered."));
    }


    // CREATE reservation slot
    public ReservationSlotResponse createSlot(ReservationSlotRequest req) {
        ReservationSlot slot = new ReservationSlot();
        slot.setRestaurant(restaurantService.getRestaurantEntity(req.restPhone()));
        slot.setSlotDate(req.slotDate());
        slot.setSlotTime(req.slotTime());
        slot.setSlotCapacity(req.slotCapacity());

        return toResponse(reservationSlotRepository.save(slot));
    }


    // DELETE reservation slot
    public void deleteSlot(ReservationSlotId id) {

        getSlotEntity(id); // 404 if missing
        reservationSlotRepository.deleteById(id);
    }


    private ReservationSlotResponse toResponse(ReservationSlot s) {
        int booked = reservationRepository.sumPartySizeForSlot(
                s.getRestaurant().getRestPhone(), s.getSlotDate(), s.getSlotTime(), INACTIVE_STATUSES);
        return ReservationSlotResponse.from(s, booked);
    }
}
