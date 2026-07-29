package com.reservex.backend.dto;

public record ReservationHistoryRequest(Integer resNum, String changedTo, String changedByEmail) {
}
