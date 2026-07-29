package com.reservex.backend.controller;

import com.reservex.backend.dto.RestaurantRequest;
import com.reservex.backend.dto.RestaurantResponse;
import com.reservex.backend.service.RestaurantService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/restaurants")
public class RestaurantController {


    private final RestaurantService restaurantService;


    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }


    // GET all restaurants, optionally filtered: /restaurants?search=term
    @GetMapping
    public List<RestaurantResponse> getAllRestaurants(
            @RequestParam(required = false) String search) {

        return restaurantService.getAllRestaurants(search);
    }


    // GET restaurant by phone
    @GetMapping("/{restPhone}")
    public RestaurantResponse getRestaurantById(
            @PathVariable String restPhone) {

        return restaurantService.getRestaurantResponse(restPhone);
    }


    // CREATE restaurant
    @PostMapping
    public RestaurantResponse createRestaurant(
            @Valid @RequestBody RestaurantRequest restaurant) {

        return restaurantService.createRestaurant(restaurant);
    }


    // DELETE restaurant
    @DeleteMapping("/{restPhone}")
    public ResponseEntity<Void> deleteRestaurant(
            @PathVariable String restPhone) {

        restaurantService.deleteRestaurant(restPhone);
        return ResponseEntity.noContent().build();
    }

}
