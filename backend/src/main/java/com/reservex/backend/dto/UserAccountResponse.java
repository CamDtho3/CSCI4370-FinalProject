package com.reservex.backend.dto;

import com.reservex.backend.entity.UserAccount;
import java.time.LocalDateTime;

/** pwdHash never leaves the server — deliberately absent here. */
public record UserAccountResponse(
    String email,
    String userRole,
    String fname,
    String lname,
    String userPhone,
    LocalDateTime acctCreated,
    String employerPhone,
    String employerName) {

  public static UserAccountResponse from(UserAccount u) {
    var employer = u.getEmployer();
    return new UserAccountResponse(
        u.getEmail(),
        u.getUserRole(),
        u.getFname(),
        u.getLname(),
        u.getUserPhone(),
        u.getAcctCreated(),
        employer != null ? employer.getRestPhone() : null,
        employer != null ? employer.getRestName() : null);
  }
}
