package com.reservex.backend.controller;

import com.reservex.backend.entity.Review;
import com.reservex.backend.entity.ReviewId;
import com.reservex.backend.service.ReviewService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;


    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }


    // GET all reviews
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }


    // POST create review
    @PostMapping
    public Review createReview(
            @RequestBody Review review) {

        return reviewService.createReview(review);
    }


    // DELETE review using composite key
    @DeleteMapping
    public void deleteReview(
            @RequestBody ReviewId id) {

        reviewService.deleteReview(id);
    }
}