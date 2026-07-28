package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reservation")
@Getter
@Setter
@NoArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "res_num")
    private Integer resNum;

    private Integer partySize;

    @Column(name = "special_req")
    private String specialReq;

    private String resStatus;

    private LocalDateTime resCreated;

    private LocalDate slotDate;

    private LocalTime slotTime;

    @ManyToOne
    @JoinColumn(name = "rest_phone")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "email")
    private UserAccount user;
}