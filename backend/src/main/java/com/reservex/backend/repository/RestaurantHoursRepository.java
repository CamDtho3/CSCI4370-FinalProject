package com.reservex.backend.repository;

import com.reservex.backend.entity.RestaurantHours;
import com.reservex.backend.entity.RestaurantHoursId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantHoursRepository extends JpaRepository<RestaurantHours, RestaurantHoursId> {

}