package com.reservex.backend.dto;

public record RestaurantRequest(
    String restPhone,
    String restName,
    String street,
    String zip,
    String city,
    String state,
    String cuisine,
    String priceRange,
    String imageUrl) {
}
