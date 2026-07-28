package com.reservex.backend.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewId implements Serializable {

    private String email;
    private String restPhone;
}