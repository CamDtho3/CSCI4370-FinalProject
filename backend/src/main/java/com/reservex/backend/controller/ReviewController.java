package com.reservex.backend.controller;

import com.reservex.backend.common.auth.AuthSession;
import com.reservex.backend.dto.ReviewRequest;
import com.reservex.backend.dto.ReviewResponse;
import com.reservex.backend.entity.ReviewId;
import com.reservex.backend.service.ReviewService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;


    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }


    // GET all reviews
    @GetMapping
    public List<ReviewResponse> getAllReviews() {
        return reviewService.getAllReviews();
    }


    // POST create review — as the signed-in diner
    @PostMapping
    public ReviewResponse createReview(
            @Valid @RequestBody ReviewRequest review,
            HttpSession session) {

        return reviewService.createReview(review, AuthSession.requireEmail(session));
    }


    // DELETE review using composite key — your own review only
    @DeleteMapping
    public ResponseEntity<Void> deleteReview(
            @RequestBody ReviewId id,
            HttpSession session) {

        reviewService.deleteReview(id, AuthSession.requireEmail(session));
        return ResponseEntity.noContent().build();
    }
}
