package com.reservex.backend.service;

import com.reservex.backend.common.exception.ApiException;
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


    public ReviewResponse createReview(ReviewRequest req, String reviewerEmail) {
        // Both throw NOT_FOUND themselves — confirms the FKs before we insert
        // rather than letting a bad reference surface as a raw 500.
        userAccountService.getUserEntity(reviewerEmail);
        restaurantService.getRestaurantEntity(req.restPhone());

        Review review = new Review();
        review.setEmail(reviewerEmail);
        review.setRestPhone(req.restPhone());
        review.setRating(req.rating());
        review.setComment(req.comment());
        review.setReviewCreated(LocalDateTime.now());

        return ReviewResponse.from(reviewRepository.save(review));
    }


    /** Only the diner who wrote the review may delete it. */
    public void deleteReview(ReviewId id, String actingEmail) {
        reviewRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("NOT_FOUND", "That review no longer exists."));

        if (!id.getEmail().equals(actingEmail)) {
            throw ApiException.forbidden("FORBIDDEN", "You can only delete your own review.");
        }

        reviewRepository.deleteById(id);
    }
}
