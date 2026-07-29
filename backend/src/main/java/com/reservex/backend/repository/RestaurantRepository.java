package com.reservex.backend.repository;

import com.reservex.backend.entity.Restaurant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, String> {

    /**
     * Simple substring match on name/cuisine/city. Not a replacement for the
     * frontend's typeahead ranking rules (lib/search.ts) — just enough for
     * the backend to filter a result set until that gets reconciled.
     */
    @Query("SELECT r FROM Restaurant r WHERE "
            + "LOWER(r.restName) LIKE LOWER(CONCAT('%', :term, '%')) OR "
            + "LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :term, '%')) OR "
            + "LOWER(r.city) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Restaurant> search(@Param("term") String term);
}
