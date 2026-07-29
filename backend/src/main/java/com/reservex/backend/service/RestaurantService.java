package com.reservex.backend.service;

import com.reservex.backend.entity.Restaurant;
import com.reservex.backend.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;


    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }


    // GET all restaurants
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }


    // GET one restaurant
    public Optional<Restaurant> getRestaurantById(String restPhone) {
        return restaurantRepository.findById(restPhone);
    }


    // CREATE restaurant
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }


    // DELETE restaurant
    public void deleteRestaurant(String restPhone) {
        restaurantRepository.deleteById(restPhone);
    }
}