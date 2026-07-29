package com.reservex.backend.service;

import com.reservex.backend.entity.RestaurantHours;
import com.reservex.backend.repository.RestaurantHoursRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantHoursService {

    private final RestaurantHoursRepository restaurantHoursRepository;


    public RestaurantHoursService(RestaurantHoursRepository restaurantHoursRepository) {
        this.restaurantHoursRepository = restaurantHoursRepository;
    }


    // GET all hours
    public List<RestaurantHours> getAllHours() {
        return restaurantHoursRepository.findAll();
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