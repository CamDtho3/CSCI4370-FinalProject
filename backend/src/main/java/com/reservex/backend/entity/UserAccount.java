package com.reservex.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_account")
@Getter
@Setter
@NoArgsConstructor
public class UserAccount {

    @Id
    @Column(length = 255)
    private String email;

    @Column(name = "pwd_hash", nullable = false)
    private String pwdHash;

    @Column(name = "user_role", nullable = false)
    private String userRole;

    private String fname;

    private String lname;

    @Column(name = "user_phone")
    private String userPhone;

    @Column(name = "acct_created")
    private LocalDateTime acctCreated;

    @ManyToOne
    @JoinColumn(name = "employer_phone")
    private Restaurant employer;
}