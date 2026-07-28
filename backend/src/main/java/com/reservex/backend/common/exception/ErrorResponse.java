package com.reservex.backend.common.exception;

import java.time.Instant;

/**
 * Wire shape for every error response. The frontend's ApiError client
 * (see mocks/reservations.ts::MockApiError) switches on {@code code},
 * e.g. "SLOT_FULL" — keep codes stable once a screen depends on one.
 */
public record ErrorResponse(
    int status,
    String code,
    String message,
    Instant timestamp,
    String path) {

  public static ErrorResponse of(int status, String code, String message, String path) {
    return new ErrorResponse(status, code, message, Instant.now(), path);
  }
}
