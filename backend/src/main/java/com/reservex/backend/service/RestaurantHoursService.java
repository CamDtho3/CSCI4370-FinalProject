package com.reservex.backend.service;

import com.reservex.backend.dto.OperationHoursResponse;
import com.reservex.backend.entity.RestaurantHours;
import com.reservex.backend.repository.RestaurantHoursRepository;

import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class RestaurantHoursService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final RestaurantHoursRepository restaurantHoursRepository;


    public RestaurantHoursService(RestaurantHoursRepository restaurantHoursRepository) {
        this.restaurantHoursRepository = restaurantHoursRepository;
    }


    // GET all hours
    public List<RestaurantHours> getAllHours() {
        return restaurantHoursRepository.findAll();
    }

    public Optional<RestaurantHours> getHoursByRestaurantAndDay(
            String restPhone,
            String dayOfWeek) {
        return restaurantHoursRepository
                .findByRestaurant_RestPhoneAndDayOfWeekIgnoreCase(restPhone, dayOfWeek);
    }

    public Optional<OperationHoursResponse> getHoursResponseByRestaurantAndDay(
            String restPhone,
            String dayOfWeek) {
        return getHoursByRestaurantAndDay(restPhone, dayOfWeek)
                .map(hours -> new OperationHoursResponse(
                        hours.getRestaurant().getRestPhone(),
                        hours.getDayOfWeek(),
                        hours.getOpenTime() == null ? null : hours.getOpenTime().format(TIME_FORMATTER),
                        hours.getCloseTime() == null ? null : hours.getCloseTime().format(TIME_FORMATTER),
                        Boolean.TRUE.equals(hours.getIsClosed())));
    }


    // CREATE hours
    public RestaurantHours createHours(RestaurantHours hours) {
        return restaurantHoursRepository.save(hours);
    }


    // DELETE hours
    public void deleteHours(RestaurantHours hours) {
        restaurantHoursRepository.delete(hours);
    }
}
