package com.reservex.backend.controller;

import com.reservex.backend.common.auth.AuthSession;
import com.reservex.backend.dto.OperationHoursResponse;
import com.reservex.backend.dto.RestaurantHoursRequest;
import com.reservex.backend.dto.RestaurantHoursResponse;
import com.reservex.backend.entity.RestaurantHoursId;
import com.reservex.backend.service.RestaurantHoursService;

import jakarta.servlet.http.HttpSession;
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

    // GET restaurant hours for one restaurant on one day
    @GetMapping("/{restPhone}")
    public ResponseEntity<OperationHoursResponse> getHoursByRestaurantAndDay(
            @PathVariable String restPhone,
            @RequestParam String dayOfWeek) {

        return restaurantHoursService
                .getHoursResponseByRestaurantAndDay(restPhone, dayOfWeek)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    // CREATE restaurant hours — staff at the target restaurant only
    @PostMapping
    public RestaurantHoursResponse createHours(
            @Valid @RequestBody RestaurantHoursRequest hours,
            HttpSession session) {

        return restaurantHoursService.createHours(hours, AuthSession.requireEmail(session));

    }


    // DELETE restaurant hours — takes just the composite key, not the full entity
    @DeleteMapping
    public ResponseEntity<Void> deleteHours(
            @RequestBody RestaurantHoursId id,
            HttpSession session) {

        restaurantHoursService.deleteHours(id, AuthSession.requireEmail(session));
        return ResponseEntity.noContent().build();
    }

}