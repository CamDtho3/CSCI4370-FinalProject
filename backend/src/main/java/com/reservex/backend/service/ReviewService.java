package com.reservex.backend.service;

import com.reservex.backend.dto.ReviewRequest;
import com.reservex.backend.dto.ReviewResponse;
import com.reservex.backend.entity.Review;
import com.reservex.backend.entity.ReviewId;
import com.reservex.backend.repository.ReviewRepository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserAccountService userAccountService;
    private final RestaurantService restaurantService;


    public ReviewService(
            ReviewRepository reviewRepository,
            UserAccountService userAccountService,
            RestaurantService restaurantService) {

        this.reviewRepository = reviewRepository;
        this.userAccountService = userAccountService;
        this.restaurantService = restaurantService;
    }


    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(ReviewResponse::from)
                .toList();
    }


    public ReviewResponse createReview(ReviewRequest req) {
        // Both throw NOT_FOUND themselves — confirms the FKs before we insert
        // rather than letting a bad reference surface as a raw 500.
        userAccountService.getUserEntity(req.email());
        restaurantService.getRestaurantEntity(req.restPhone());

        Review review = new Review();
        review.setEmail(req.email());
        review.setRestPhone(req.restPhone());
        review.setRating(req.rating());
        review.setComment(req.comment());
        review.setReviewCreated(LocalDateTime.now());

        return ReviewResponse.from(reviewRepository.save(review));
    }


    public void deleteReview(ReviewId id) {
        reviewRepository.deleteById(id);
    }
}
