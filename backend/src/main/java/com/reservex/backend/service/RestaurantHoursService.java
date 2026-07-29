package com.reservex.backend.service;

import com.reservex.backend.dto.RestaurantHoursRequest;
import com.reservex.backend.dto.RestaurantHoursResponse;
import com.reservex.backend.entity.RestaurantHours;
import com.reservex.backend.repository.RestaurantHoursRepository;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class RestaurantHoursService {

    private final RestaurantHoursRepository restaurantHoursRepository;
    private final RestaurantService restaurantService;


    public RestaurantHoursService(
            RestaurantHoursRepository restaurantHoursRepository,
            RestaurantService restaurantService) {

        this.restaurantHoursRepository = restaurantHoursRepository;
        this.restaurantService = restaurantService;
    }


    // GET all hours
    public List<RestaurantHoursResponse> getAllHours() {
        return restaurantHoursRepository.findAll().stream()
                .map(RestaurantHoursResponse::from)
                .toList();
    }


    // CREATE hours
    public RestaurantHoursResponse createHours(RestaurantHoursRequest req) {
        RestaurantHours hours = new RestaurantHours();
        hours.setRestaurant(restaurantService.getRestaurantEntity(req.restPhone()));
        hours.setDayOfWeek(req.dayOfWeek());
        hours.setOpenTime(req.openTime());
        hours.setCloseTime(req.closeTime());
        hours.setIsClosed(req.isClosed() != null ? req.isClosed() : Boolean.FALSE);

        return RestaurantHoursResponse.from(restaurantHoursRepository.save(hours));
    }


    // DELETE hours
    public void deleteHours(RestaurantHours hours) {
        restaurantHoursRepository.delete(hours);
    }
}
