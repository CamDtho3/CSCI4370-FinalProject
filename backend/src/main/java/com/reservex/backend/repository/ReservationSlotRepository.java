package com.reservex.backend.repository;

import com.reservex.backend.entity.ReservationSlot;
import com.reservex.backend.entity.ReservationSlotId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationSlotRepository extends JpaRepository<ReservationSlot, ReservationSlotId> {

}