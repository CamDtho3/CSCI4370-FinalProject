package com.reservex.backend.service;

import com.reservex.backend.entity.Reservation;
import com.reservex.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;


    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }


    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getReservationsByRestaurantAndDate(
            String restPhone,
            LocalDate slotDate) {
        return reservationRepository
                .findByRestaurant_RestPhoneAndSlotDateOrderBySlotTimeAsc(restPhone, slotDate);
    }


    public Optional<Reservation> getReservationById(Integer id) {
        return reservationRepository.findById(id);
    }


    public Reservation createReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }


    public void deleteReservation(Integer id) {
        reservationRepository.deleteById(id);
    }
}
