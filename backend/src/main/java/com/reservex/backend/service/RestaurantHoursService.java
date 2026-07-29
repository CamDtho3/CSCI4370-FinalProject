package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
import com.reservex.backend.dto.OperationHoursResponse;
import com.reservex.backend.dto.RestaurantHoursRequest;
import com.reservex.backend.dto.RestaurantHoursResponse;
import com.reservex.backend.entity.RestaurantHours;
import com.reservex.backend.entity.RestaurantHoursId;
import com.reservex.backend.repository.RestaurantHoursRepository;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class RestaurantHoursService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final RestaurantHoursRepository restaurantHoursRepository;
    private final RestaurantService restaurantService;
    private final UserAccountService userAccountService;


    public RestaurantHoursService(
            RestaurantHoursRepository restaurantHoursRepository,
            RestaurantService restaurantService,
            UserAccountService userAccountService) {

        this.restaurantHoursRepository = restaurantHoursRepository;
        this.restaurantService = restaurantService;
        this.userAccountService = userAccountService;
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

    public Optional<RestaurantHours> getHoursByRestaurantAndDay(
            String restPhone,
            String dayOfWeek) {
        return restaurantHoursRepository
                .findByRestaurant_RestPhoneAndDayOfWeekIgnoreCase(restPhone, dayOfWeek);
    }

    public Optional<OperationHoursResponse> getHoursResponseByRestaurantAndDay(
            String restPhone,
            String dayOfWeek) {
        return getHoursByRestaurantAndDay(restPhone, dayOfWeek)
                .map(hours -> new OperationHoursResponse(
                        hours.getRestaurant().getRestPhone(),
                        hours.getDayOfWeek(),
                        hours.getOpenTime() == null ? null : hours.getOpenTime().format(TIME_FORMATTER),
                        hours.getCloseTime() == null ? null : hours.getCloseTime().format(TIME_FORMATTER),
                        Boolean.TRUE.equals(hours.getIsClosed())));
    }


    // CREATE hours — staff at the target restaurant only
    public RestaurantHoursResponse createHours(RestaurantHoursRequest req, String actingEmail) {
        userAccountService.requireStaffAt(actingEmail, req.restPhone());

        RestaurantHours hours = new RestaurantHours();
        hours.setRestaurant(restaurantService.getRestaurantEntity(req.restPhone()));
        hours.setDayOfWeek(req.dayOfWeek());
        hours.setOpenTime(req.openTime());
        hours.setCloseTime(req.closeTime());
        hours.setIsClosed(req.isClosed() != null ? req.isClosed() : Boolean.FALSE);

        return RestaurantHoursResponse.from(restaurantHoursRepository.save(hours));
    }


    // DELETE hours — by composite key, not the full entity; staff at the restaurant only
    public void deleteHours(RestaurantHoursId id, String actingEmail) {
        RestaurantHours hours = getHoursEntity(id); // 404 if missing
        userAccountService.requireStaffAt(actingEmail, hours.getRestaurant().getRestPhone());
        restaurantHoursRepository.deleteById(id);
    }
}