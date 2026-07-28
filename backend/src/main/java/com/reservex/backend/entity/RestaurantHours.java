package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Table(name = "restaurant_hours")
@Getter
@Setter
@NoArgsConstructor
@IdClass(RestaurantHoursId.class)
public class RestaurantHours {

    @Id
    @ManyToOne
    @JoinColumn(name = "rest_phone")
    private Restaurant restaurant;

    @Id
    @Column(name = "day_of_week")
    private String dayOfWeek;

    private LocalTime openTime;

    private LocalTime closeTime;

    private Boolean isClosed;
}