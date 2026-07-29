package com.reservex.backend.service;

import com.reservex.backend.entity.Reservation;
import com.reservex.backend.repository.ReservationRepository;
import org.springframework.stereotype.Service;

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