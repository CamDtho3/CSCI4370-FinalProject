package com.reservex.backend.controller;

import com.reservex.backend.dto.RestaurantHoursRequest;
import com.reservex.backend.dto.RestaurantHoursResponse;
import com.reservex.backend.entity.RestaurantHoursId;
import com.reservex.backend.service.RestaurantHoursService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/restaurant-hours")
public class RestaurantHoursController {


    private final RestaurantHoursService restaurantHoursService;


    public RestaurantHoursController(RestaurantHoursService restaurantHoursService) {
        this.restaurantHoursService = restaurantHoursService;
    }


    // GET all restaurant hours
    @GetMapping
    public List<RestaurantHoursResponse> getAllHours() {

        return restaurantHoursService.getAllHours();

    }


    // CREATE restaurant hours
    @PostMapping
    public RestaurantHoursResponse createHours(
            @Valid @RequestBody RestaurantHoursRequest hours) {

        return restaurantHoursService.createHours(hours);

    }


    // DELETE restaurant hours — takes just the composite key, not the full entity
    @DeleteMapping
    public ResponseEntity<Void> deleteHours(
            @RequestBody RestaurantHoursId id) {

        restaurantHoursService.deleteHours(id);
        return ResponseEntity.noContent().build();
    }

}
