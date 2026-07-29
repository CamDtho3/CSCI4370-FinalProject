package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.RestaurantHoursRequest;
import com.reservex.backend.dto.RestaurantHoursResponse;
import com.reservex.backend.entity.RestaurantHours;
import com.reservex.backend.entity.RestaurantHoursId;
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


    public RestaurantHours getHoursEntity(RestaurantHoursId id) {
        return restaurantHoursRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(
                        "NOT_FOUND", "Those restaurant hours no longer exist."));
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


    // DELETE hours — by composite key, not the full entity
    public void deleteHours(RestaurantHoursId id) {
        getHoursEntity(id); // 404 if missing
        restaurantHoursRepository.deleteById(id);
    }
}
