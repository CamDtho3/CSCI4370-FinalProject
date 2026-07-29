package com.reservex.backend.controller;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.RestaurantResponse;
import com.reservex.backend.entity.Restaurant;
import com.reservex.backend.service.RestaurantService;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/restaurants")
public class RestaurantController {


    private final RestaurantService restaurantService;


    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }


    // GET all restaurants
    @GetMapping
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantService.getAllRestaurants().stream()
                .map(RestaurantResponse::from)
                .toList();
    }


    // GET restaurant by phone
    @GetMapping("/{restPhone}")
    public RestaurantResponse getRestaurantById(
            @PathVariable String restPhone) {

        return restaurantService
                .getRestaurantById(restPhone)
                .map(RestaurantResponse::from)
                .orElseThrow(() -> ApiException.notFound(
                        "NOT_FOUND", "That restaurant no longer exists."));
    }


    // CREATE restaurant
    @PostMapping
    public RestaurantResponse createRestaurant(
            @RequestBody Restaurant restaurant) {

        return RestaurantResponse.from(restaurantService.createRestaurant(restaurant));
    }


    // DELETE restaurant
    @DeleteMapping("/{restPhone}")
    public void deleteRestaurant(
            @PathVariable String restPhone) {

        restaurantService.deleteRestaurant(restPhone);
    }

}
