package com.reservex.backend.service;

import com.reservex.backend.entity.Review;
import com.reservex.backend.entity.ReviewId;
import com.reservex.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;


    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }


    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }


    public Review createReview(Review review) {
        return reviewRepository.save(review);
    }


    public void deleteReview(ReviewId id) {
        reviewRepository.deleteById(id);
    }
}