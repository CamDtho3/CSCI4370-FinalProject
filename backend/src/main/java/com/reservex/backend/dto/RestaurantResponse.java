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
    String priceRange,
    String imageUrl,
    LocalDateTime restCreated) {

  public static RestaurantResponse from(Restaurant r) {
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
        r.getRestCreated());
  }
}
