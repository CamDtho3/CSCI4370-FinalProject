package com.reservex.backend.entity;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationSlotId implements Serializable {

    private String restaurant;
    private LocalDate slotDate;
    private LocalTime slotTime;
}