package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservation_slot")
@Getter
@Setter
@NoArgsConstructor
@IdClass(ReservationSlotId.class)
public class ReservationSlot {

    @Id
    @ManyToOne
    @JoinColumn(name = "rest_phone")
    private Restaurant restaurant;

    @Id
    private LocalDate slotDate;

    @Id
    private LocalTime slotTime;

    @Column(name = "slot_capacity")
    private Integer slotCapacity;
}