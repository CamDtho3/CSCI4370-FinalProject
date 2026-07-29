package com.reservex.backend.repository;

import com.reservex.backend.entity.Review;
import com.reservex.backend.entity.ReviewId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, ReviewId> {

}