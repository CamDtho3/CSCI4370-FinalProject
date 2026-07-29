package com.reservex.backend.dto;

import com.reservex.backend.entity.Restaurant;
import java.time.LocalDateTime;

public record RestaurantResponse(
    String restPhone,
    String restName,
    String street,
    String zip,
    String city,
    String state,
    String cuisine,
    Integer priceRange,
    String imageUrl,
    LocalDateTime restCreated,
    Double avgRating,
    long reviewCount) {

  /** avgRating is null, not 0, when the restaurant has no reviews yet. */
  public static RestaurantResponse from(Restaurant r, Double avgRating, long reviewCount) {
    return new RestaurantResponse(
        r.getRestPhone(),
        r.getRestName(),
        r.getStreet(),
        r.getZip(),
        r.getCity(),
        r.getState(),
        r.getCuisine(),
        r.getPriceRange(),
        r.getImageUrl(),
        r.getRestCreated(),
        avgRating,
        reviewCount);
  }
}
