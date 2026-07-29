package com.reservex.backend.dto;

import com.reservex.backend.entity.RestaurantHours;
import java.time.LocalTime;

public record RestaurantHoursResponse(
    String restPhone, String dayOfWeek, LocalTime openTime, LocalTime closeTime, Boolean isClosed) {

  public static RestaurantHoursResponse from(RestaurantHours h) {
    return new RestaurantHoursResponse(
        h.getRestaurant().getRestPhone(),
        h.getDayOfWeek(),
        h.getOpenTime(),
        h.getCloseTime(),
        h.getIsClosed());
  }
}
