package com.reservex.backend.repository;

import com.reservex.backend.entity.Review;
import com.reservex.backend.entity.ReviewId;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, ReviewId> {

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restPhone = :restPhone")
    Optional<Double> findAverageRatingByRestPhone(@Param("restPhone") String restPhone);

    long countByRestPhone(String restPhone);
}
