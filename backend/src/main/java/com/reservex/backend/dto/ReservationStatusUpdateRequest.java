package com.reservex.backend.dto;

/** {@code changedByEmail} stands in for the authenticated principal — see ReservationRequest. */
public record ReservationStatusUpdateRequest(String toStatus, String changedByEmail) {
}
