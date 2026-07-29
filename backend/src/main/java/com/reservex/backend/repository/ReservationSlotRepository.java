package com.reservex.backend.repository;

import com.reservex.backend.entity.ReservationSlot;
import com.reservex.backend.entity.ReservationSlotId;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationSlotRepository extends JpaRepository<ReservationSlot, ReservationSlotId> {

    List<ReservationSlot> findByRestaurant_RestPhoneAndSlotDateOrderBySlotTimeAsc(
            String restPhone, LocalDate slotDate);

    Optional<ReservationSlot> findByRestaurant_RestPhoneAndSlotDateAndSlotTime(
            String restPhone, LocalDate slotDate, LocalTime slotTime);
}
