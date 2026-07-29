package com.reservex.backend.dto;

import com.reservex.backend.entity.Review;
import java.time.LocalDateTime;

public record ReviewResponse(
    String email, String restPhone, Integer rating, String comment, LocalDateTime reviewCreated) {

  public static ReviewResponse from(Review r) {
    return new ReviewResponse(
        r.getEmail(), r.getRestPhone(), r.getRating(), r.getComment(), r.getReviewCreated());
  }
}
