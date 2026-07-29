package com.reservex.backend.common.auth;

import com.reservex.backend.common.exception.ApiException;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;

/**
 * Session-backed identity — the signed-in account's email lives in the
 * servlet session (cookie-based, HttpOnly by default), never in a
 * request body. Callers that need "who is making this request" read it
 * from here instead of trusting a client-supplied field.
 */
public final class AuthSession {

  private static final String EMAIL_ATTR = "email";

  private AuthSession() {
  }

  public static void login(HttpSession session, String email) {
    session.setAttribute(EMAIL_ATTR, email);
  }

  public static void logout(HttpSession session) {
    session.invalidate();
  }

  public static Optional<String> currentEmail(HttpSession session) {
    return Optional.ofNullable((String) session.getAttribute(EMAIL_ATTR));
  }

  public static String requireEmail(HttpSession session) {
    return currentEmail(session)
        .orElseThrow(() -> ApiException.unauthorized("UNAUTHENTICATED", "You must be signed in."));
  }
}
