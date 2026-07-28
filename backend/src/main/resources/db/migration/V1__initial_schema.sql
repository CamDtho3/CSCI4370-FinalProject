-- Users

CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,

    pwd_hash VARCHAR(255) NOT NULL,

    user_role VARCHAR(20) NOT NULL
        CHECK (user_role IN ('CUSTOMER', 'EMPLOYEE', 'ADMIN')),

    acct_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    fname VARCHAR(100) NOT NULL,

    lname VARCHAR(100) NOT NULL,

    user_phone VARCHAR(20) UNIQUE,

    employer_phone VARCHAR(20),

    CHECK (email <> '')
);


-- Location

CREATE TABLE location (

    zip CHAR(5) PRIMARY KEY,

    city VARCHAR(100) NOT NULL,

    state CHAR(2) NOT NULL,

    CHECK (zip ~ '^[0-9]{5}$'),

    CHECK (state ~ '^[A-Z]{2}$')
);



-- Restaurant

CREATE TABLE restaurant (

    rest_phone VARCHAR(20) PRIMARY KEY,

    rest_name VARCHAR(150) NOT NULL,

    street VARCHAR(200) NOT NULL,

    zip CHAR(5) NOT NULL,

    cuisine VARCHAR(100) NOT NULL,

    price_range VARCHAR(10) NOT NULL
        CHECK (
            price_range IN ('$', '$$', '$$$', '$$$$')
        ),

    rest_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_restaurant_location
        FOREIGN KEY(zip)
        REFERENCES location(zip)
);



-- Hours

CREATE TABLE hours (

    rest_phone VARCHAR(20) NOT NULL,

    day_of_week SMALLINT NOT NULL
        CHECK(day_of_week BETWEEN 0 AND 6),

    open_time TIME,

    close_time TIME,

    is_closed BOOLEAN NOT NULL DEFAULT FALSE,


    PRIMARY KEY(rest_phone, day_of_week),


    CONSTRAINT fk_hours_restaurant
        FOREIGN KEY(rest_phone)
        REFERENCES restaurant(rest_phone)
        ON DELETE CASCADE,


    CHECK(
        is_closed = TRUE
        OR open_time < close_time
    )
);



-- Availability

CREATE TABLE availability (

    rest_phone VARCHAR(20) NOT NULL,

    slot_date DATE NOT NULL,

    slot_time TIME NOT NULL,

    slot_capacity INTEGER NOT NULL
        CHECK(slot_capacity >= 0),


    PRIMARY KEY(
        rest_phone,
        slot_date,
        slot_time
    ),


    CONSTRAINT fk_availability_restaurant
        FOREIGN KEY(rest_phone)
        REFERENCES restaurant(rest_phone)
        ON DELETE CASCADE
);



-- Reservation

CREATE TABLE reservation (

    res_num BIGSERIAL PRIMARY KEY,


    email VARCHAR(255) NOT NULL,


    rest_phone VARCHAR(20) NOT NULL,


    slot_date DATE NOT NULL,


    slot_time TIME NOT NULL,


    party_size INTEGER NOT NULL
        CHECK(
            party_size BETWEEN 1 AND 30
        ),


    special_req TEXT,


    res_status VARCHAR(20) NOT NULL
        CHECK(
            res_status IN (
                'PENDING',
                'CONFIRMED',
                'CHECKED_IN',
                'COMPLETED',
                'CANCELLED',
                'NO_SHOW'
            )
        ),


    res_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,



    CONSTRAINT fk_reservation_user
        FOREIGN KEY(email)
        REFERENCES users(email),



    CONSTRAINT fk_reservation_restaurant
        FOREIGN KEY(rest_phone)
        REFERENCES restaurant(rest_phone),



    CONSTRAINT fk_reservation_availability
        FOREIGN KEY(
            rest_phone,
            slot_date,
            slot_time
        )
        REFERENCES availability(
            rest_phone,
            slot_date,
            slot_time
        )
);



-- Reservation History

CREATE TABLE reservation_history (

    res_num BIGINT NOT NULL,


    changed_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,


    changed_to VARCHAR(20) NOT NULL
        CHECK(
            changed_to IN (
                'PENDING',
                'CONFIRMED',
                'CHECKED_IN',
                'COMPLETED',
                'CANCELLED',
                'NO_SHOW'
            )
        ),


    changed_by VARCHAR(255) NOT NULL,


    PRIMARY KEY(
        res_num,
        changed_at
    ),



    CONSTRAINT fk_history_reservation
        FOREIGN KEY(res_num)
        REFERENCES reservation(res_num)
        ON DELETE CASCADE,



    CONSTRAINT fk_history_user
        FOREIGN KEY(changed_by)
        REFERENCES users(email)
);



-- Waitlist

CREATE TABLE waitlist (

    wait_num BIGSERIAL PRIMARY KEY,


    email VARCHAR(255) NOT NULL,


    rest_phone VARCHAR(20) NOT NULL,


    wait_date DATE NOT NULL,


    wait_time TIME NOT NULL,


    wait_party INTEGER NOT NULL
        CHECK(
            wait_party BETWEEN 1 AND 30
        ),


    wait_status VARCHAR(20) NOT NULL
        CHECK(
            wait_status IN (
                'WAITING',
                'NOTIFIED',
                'SEATED',
                'CANCELLED'
            )
        ),


    wait_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,



    CONSTRAINT fk_waitlist_user
        FOREIGN KEY(email)
        REFERENCES users(email),



    CONSTRAINT fk_waitlist_restaurant
        FOREIGN KEY(rest_phone)
        REFERENCES restaurant(rest_phone)
);


-- Reviews

CREATE TABLE review (

    email VARCHAR(255) NOT NULL,


    rest_phone VARCHAR(20) NOT NULL,


    rating INTEGER NOT NULL
        CHECK(
            rating BETWEEN 1 AND 5
        ),


    comment TEXT,


    review_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,



    PRIMARY KEY(
        email,
        rest_phone
    ),



    CONSTRAINT fk_review_user
        FOREIGN KEY(email)
        REFERENCES users(email)
        ON DELETE CASCADE,



    CONSTRAINT fk_review_restaurant
        FOREIGN KEY(rest_phone)
        REFERENCES restaurant(rest_phone)
        ON DELETE CASCADE
);



-- INDEXES

CREATE INDEX idx_restaurant_zip
ON restaurant(zip);


CREATE INDEX idx_availability_restaurant
ON availability(rest_phone);


CREATE INDEX idx_availability_date
ON availability(slot_date);


CREATE INDEX idx_reservation_email
ON reservation(email);


CREATE INDEX idx_reservation_restaurant
ON reservation(rest_phone);


CREATE INDEX idx_reservation_status
ON reservation(res_status);


CREATE INDEX idx_waitlist_restaurant
ON waitlist(rest_phone);


CREATE INDEX idx_waitlist_status
ON waitlist(wait_status);


CREATE INDEX idx_review_restaurant
ON review(rest_phone);


CREATE INDEX idx_history_reservation
ON reservation_history(res_num);