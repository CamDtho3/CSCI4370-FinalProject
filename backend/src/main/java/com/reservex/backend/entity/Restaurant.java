package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurant")
@Getter
@Setter
@NoArgsConstructor
public class Restaurant {

    @Id
    @Column(name = "rest_phone", length = 20)
    private String restPhone;

    @Column(name = "rest_name", nullable = false)
    private String restName;

    private String street;

    private String zip;

    private String city;

    private String state;

    private String cuisine;

    @Column(name = "price_range")
    private Integer priceRange;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "rest_created", nullable = false)
    private LocalDateTime restCreated;
}