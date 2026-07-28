CREATE TABLE Restaurant (
    rest_phone      VARCHAR(20)     NOT NULL,
    rest_name       VARCHAR(100)    NOT NULL,
    street          VARCHAR(150)    NOT NULL,
    zip             VARCHAR(10)     NOT NULL,
    city            VARCHAR(50)     NOT NULL,
    state           VARCHAR(30)     NOT NULL,
    cuisine         VARCHAR(50)     NOT NULL,
    price_range     VARCHAR(20)     NOT NULL,
    image_url       TEXT,
    rest_created    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (rest_phone),

    CHECK (price_range IN ('$', '$$', '$$$', '$$$$'))
);


CREATE TABLE ReservationSlot (
    rest_phone      VARCHAR(20)     NOT NULL,
    slot_date       DATE            NOT NULL,
    slot_time       TIME            NOT NULL,
    slot_capacity   INTEGER         NOT NULL,

    PRIMARY KEY (rest_phone, slot_date, slot_time),

    FOREIGN KEY (rest_phone)
        REFERENCES Restaurant (rest_phone)
        ON DELETE CASCADE,

    CHECK (slot_capacity >= 0)
);


CREATE TABLE RestaurantHours (
    rest_phone      VARCHAR(20)     NOT NULL,
    day_of_week     VARCHAR(10)     NOT NULL,
    open_time       TIME,
    close_time      TIME,
    is_closed       BOOLEAN         NOT NULL DEFAULT FALSE,

    PRIMARY KEY (rest_phone, day_of_week),

    FOREIGN KEY (rest_phone)
        REFERENCES Restaurant (rest_phone)
        ON DELETE CASCADE,

    CHECK (day_of_week IN ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
                           'THURSDAY', 'FRIDAY', 'SATURDAY')),

    CHECK (is_closed = TRUE OR (open_time IS NOT NULL
                                AND close_time IS NOT NULL
                                AND open_time < close_time))
);


CREATE TABLE UserAccount (
    email           VARCHAR(255)    NOT NULL,
    pwd_hash        VARCHAR(255)    NOT NULL,
    user_role       VARCHAR(20)     NOT NULL,
    fname           VARCHAR(50)     NOT NULL,
    lname           VARCHAR(50)     NOT NULL,
    user_phone      VARCHAR(20),
    acct_created    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    employer_phone  VARCHAR(20),

    PRIMARY KEY (email),

    FOREIGN KEY (employer_phone)
        REFERENCES Restaurant (rest_phone),

    CHECK (user_role IN ('DINER', 'STAFF')),

    CHECK (employer_phone IS NULL OR user_role = 'STAFF')
);


CREATE TABLE Reservation (
    res_num         SERIAL,
    email           VARCHAR(255)    NOT NULL,
    rest_phone      VARCHAR(20)     NOT NULL,
    slot_date       DATE            NOT NULL,
    slot_time       TIME            NOT NULL,
    party_size      INTEGER         NOT NULL,
    special_req     TEXT,
    res_status      VARCHAR(20)     NOT NULL,
    res_created     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (res_num),

    FOREIGN KEY (email)
        REFERENCES UserAccount (email),

    FOREIGN KEY (rest_phone, slot_date, slot_time)
        REFERENCES ReservationSlot (rest_phone, slot_date, slot_time),

    CHECK (party_size >= 1),

    CHECK (res_status IN ('PENDING', 'CONFIRMED', 'SEATED',
                          'COMPLETED', 'CANCELLED', 'NO_SHOW'))
);


CREATE TABLE Review (
    email           VARCHAR(255)    NOT NULL,
    rest_phone      VARCHAR(20)     NOT NULL,
    rating          INTEGER         NOT NULL,
    comment         TEXT,
    review_created  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (email, rest_phone),

    FOREIGN KEY (email)
        REFERENCES UserAccount (email)
        ON DELETE CASCADE,

    FOREIGN KEY (rest_phone)
        REFERENCES Restaurant (rest_phone)
        ON DELETE CASCADE,

    CHECK (rating BETWEEN 1 AND 5)
);


CREATE TABLE ReservationHistory (
    res_num         INTEGER         NOT NULL,
    changed_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_to      VARCHAR(20)     NOT NULL,
    changed_by      VARCHAR(255)    NOT NULL,

    PRIMARY KEY (res_num, changed_at),

    FOREIGN KEY (res_num)
        REFERENCES Reservation (res_num)
        ON DELETE CASCADE,

    FOREIGN KEY (changed_by)
        REFERENCES UserAccount (email),

    CHECK (changed_to IN ('PENDING', 'CONFIRMED', 'SEATED',
                          'COMPLETED', 'CANCELLED', 'NO_SHOW'))
);
