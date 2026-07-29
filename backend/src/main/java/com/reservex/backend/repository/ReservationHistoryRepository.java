package com.reservex.backend.repository;

import com.reservex.backend.entity.ReservationHistory;
import com.reservex.backend.entity.ReservationHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationHistoryRepository extends JpaRepository<ReservationHistory, ReservationHistoryId> {

}