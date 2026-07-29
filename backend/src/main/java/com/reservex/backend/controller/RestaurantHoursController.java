package com.reservex.backend.controller;

import com.reservex.backend.entity.RestaurantHours;
import com.reservex.backend.service.RestaurantHoursService;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/restaurant-hours")
@CrossOrigin(origins = "*")
public class RestaurantHoursController {


    private final RestaurantHoursService restaurantHoursService;


    public RestaurantHoursController(RestaurantHoursService restaurantHoursService) {
        this.restaurantHoursService = restaurantHoursService;
    }


    // GET all restaurant hours
    @GetMapping
    public List<RestaurantHours> getAllHours() {

        return restaurantHoursService.getAllHours();

    }


    // CREATE restaurant hours
    @PostMapping
    public RestaurantHours createHours(
            @RequestBody RestaurantHours hours) {

        return restaurantHoursService.createHours(hours);

    }


    // DELETE restaurant hours
    @DeleteMapping
    public String deleteHours(
            @RequestBody RestaurantHours hours) {

        restaurantHoursService.deleteHours(hours);

        return "Hours deleted";
    }

}