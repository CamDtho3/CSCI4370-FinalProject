package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.RestaurantRequest;
import com.reservex.backend.dto.RestaurantResponse;
import com.reservex.backend.entity.Restaurant;
import com.reservex.backend.repository.RestaurantRepository;
import com.reservex.backend.repository.ReviewRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final ReviewRepository reviewRepository;


    public RestaurantService(RestaurantRepository restaurantRepository, ReviewRepository reviewRepository) {
        this.restaurantRepository = restaurantRepository;
        this.reviewRepository = reviewRepository;
    }


    // GET all restaurants, optionally filtered by a free-text search term
    public List<RestaurantResponse> getAllRestaurants(String search) {
        List<Restaurant> restaurants = (search == null || search.isBlank())
                ? restaurantRepository.findAll()
                : restaurantRepository.search(search.trim());

        return restaurants.stream().map(this::toResponse).toList();
    }


    // GET one restaurant
    public RestaurantResponse getRestaurantResponse(String restPhone) {
        return toResponse(getRestaurantEntity(restPhone));
    }


    /** For other services resolving the FK reference — not exposed over HTTP directly. */
    public Restaurant getRestaurantEntity(String restPhone) {
        return restaurantRepository.findById(restPhone)
                .orElseThrow(() -> ApiException.notFound(
                        "NOT_FOUND", "That restaurant no longer exists."));
    }


    // CREATE restaurant
    public RestaurantResponse createRestaurant(RestaurantRequest req) {
        Restaurant restaurant = new Restaurant();
        restaurant.setRestPhone(req.restPhone());
        restaurant.setRestName(req.restName());
        restaurant.setStreet(req.street());
        restaurant.setZip(req.zip());
        restaurant.setCity(req.city());
        restaurant.setState(req.state());
        restaurant.setCuisine(req.cuisine());
        restaurant.setPriceRange(req.priceRange());
        restaurant.setImageUrl(req.imageUrl());
        restaurant.setRestCreated(LocalDateTime.now());

        return toResponse(restaurantRepository.save(restaurant));
    }


    // DELETE restaurant
    public void deleteRestaurant(String restPhone) {
        getRestaurantEntity(restPhone); // 404 if missing
        restaurantRepository.deleteById(restPhone);
    }


    private RestaurantResponse toResponse(Restaurant r) {
        Double avgRating = reviewRepository.findAverageRatingByRestPhone(r.getRestPhone()).orElse(null);
        long reviewCount = reviewRepository.countByRestPhone(r.getRestPhone());
        return RestaurantResponse.from(r, avgRating, reviewCount);
    }
}
