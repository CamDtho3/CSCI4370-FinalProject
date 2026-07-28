package com.reservex.backend.entity;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationHistoryId implements Serializable {

    private Integer reservation;
    private LocalDateTime changedAt;
}