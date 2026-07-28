package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@IdClass(ReviewId.class)
public class Review {

    @Id
    @Column(name = "email")
    private String email;

    @Id
    @Column(name = "rest_phone")
    private String restPhone;

    private Integer rating;

    private String comment;

    @Column(name = "review_created")
    private LocalDateTime reviewCreated;


    @ManyToOne
    @JoinColumn(
        name = "email",
        insertable = false,
        updatable = false
    )
    private UserAccount user;


    @ManyToOne
    @JoinColumn(
        name = "rest_phone",
        insertable = false,
        updatable = false
    )
    private Restaurant restaurant;
}