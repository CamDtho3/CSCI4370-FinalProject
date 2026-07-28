package com.reservex.backend.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantHoursId implements Serializable {

    private String restaurant;
    private String dayOfWeek;
}