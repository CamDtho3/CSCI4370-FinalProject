package com.reservex.backend.controller;

import com.reservex.backend.common.auth.AuthSession;
import com.reservex.backend.dto.RestaurantRequest;
import com.reservex.backend.dto.RestaurantResponse;
import com.reservex.backend.service.RestaurantService;
import com.reservex.backend.service.UserAccountService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/restaurants")
public class RestaurantController {


    private final RestaurantService restaurantService;
    private final UserAccountService userAccountService;


    public RestaurantController(RestaurantService restaurantService, UserAccountService userAccountService) {
        this.restaurantService = restaurantService;
        this.userAccountService = userAccountService;
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


    // CREATE restaurant — staff only; there's no restaurant yet to scope "at" a specific one
    @PostMapping
    public RestaurantResponse createRestaurant(
            @Valid @RequestBody RestaurantRequest restaurant,
            HttpSession session) {

        userAccountService.requireStaff(AuthSession.requireEmail(session));
        return restaurantService.createRestaurant(restaurant);
    }


    // DELETE restaurant — staff at that restaurant only
    @DeleteMapping("/{restPhone}")
    public ResponseEntity<Void> deleteRestaurant(
            @PathVariable String restPhone,
            HttpSession session) {

        userAccountService.requireStaffAt(AuthSession.requireEmail(session), restPhone);
        restaurantService.deleteRestaurant(restPhone);
        return ResponseEntity.noContent().build();
    }

}
