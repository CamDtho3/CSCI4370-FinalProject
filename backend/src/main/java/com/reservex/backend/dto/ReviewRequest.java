package com.reservex.backend.dto;

public record ReviewRequest(String email, String restPhone, Integer rating, String comment) {
}
