package com.reservex.backend.service;

import com.reservex.backend.entity.ReservationSlot;
import com.reservex.backend.entity.ReservationSlotId;
import com.reservex.backend.repository.ReservationSlotRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationSlotService {

    private final ReservationSlotRepository reservationSlotRepository;


    public ReservationSlotService(
            ReservationSlotRepository reservationSlotRepository) {

        this.reservationSlotRepository = reservationSlotRepository;
    }


    // GET all reservation slots
    public List<ReservationSlot> getAllSlots() {
        return reservationSlotRepository.findAll();
    }


    // GET one reservation slot
    public ReservationSlot getSlotById(ReservationSlotId id) {

        return reservationSlotRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Reservation slot not found"));
    }


    // CREATE reservation slot
    public ReservationSlot createSlot(ReservationSlot slot) {

        return reservationSlotRepository.save(slot);
    }


    // DELETE reservation slot
    public void deleteSlot(ReservationSlotId id) {

        reservationSlotRepository.deleteById(id);
    }
}