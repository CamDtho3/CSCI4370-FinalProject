package com.reservex.backend.controller;

import com.reservex.backend.entity.Restaurant;
import com.reservex.backend.service.RestaurantService;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/restaurants")
@CrossOrigin
public class RestaurantController {


    private final RestaurantService restaurantService;


    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }


    // GET all restaurants
    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }


    // GET restaurant by phone
    @GetMapping("/{restPhone}")
    public Restaurant getRestaurantById(
            @PathVariable String restPhone) {

        return restaurantService
                .getRestaurantById(restPhone)
                .orElse(null);
    }


    // CREATE restaurant
    @PostMapping
    public Restaurant createRestaurant(
            @RequestBody Restaurant restaurant) {

        return restaurantService.createRestaurant(restaurant);
    }


    // DELETE restaurant
    @DeleteMapping("/{restPhone}")
    public void deleteRestaurant(
            @PathVariable String restPhone) {

        restaurantService.deleteRestaurant(restPhone);
    }

}