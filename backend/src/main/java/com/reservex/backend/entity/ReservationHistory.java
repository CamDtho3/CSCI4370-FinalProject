package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservation_history")
@Getter
@Setter
@NoArgsConstructor
@IdClass(ReservationHistoryId.class)
public class ReservationHistory {

    @Id
    @ManyToOne
    @JoinColumn(name = "res_num")
    private Reservation reservation;

    @Id
    private LocalDateTime changedAt;

    private String changedTo;

    @ManyToOne
    @JoinColumn(name = "changed_by")
    private UserAccount changedBy;
}