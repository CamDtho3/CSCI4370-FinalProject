CREATE TABLE Restaurant (
    rest_phone      VARCHAR(20) PRIMARY KEY,
    rest_name       VARCHAR(100) NOT NULL,
    street          VARCHAR(150),
    zip             VARCHAR(10),
    city            VARCHAR(50),
    state           VARCHAR(30),
    cuisine         VARCHAR(50),
    price_range     VARCHAR(20),
    image_url       TEXT,
    rest_created    TIMESTAMP NOT NULL
);

CREATE TABLE ReservationSlot (
    rest_phone      VARCHAR(20),
    slot_date       DATE,
    slot_time       TIME,
    slot_capacity   INTEGER NOT NULL,

    PRIMARY KEY (rest_phone, slot_date, slot_time),

    FOREIGN KEY (rest_phone)
        REFERENCES Restaurant(rest_phone)
);

CREATE TABLE RestaurantHours (
    rest_phone      VARCHAR(20),
    day_of_week     VARCHAR(10),
    open_time       TIME,
    close_time      TIME,
    is_closed       BOOLEAN,

    PRIMARY KEY (rest_phone, day_of_week),

    FOREIGN KEY (rest_phone)
        REFERENCES Restaurant(rest_phone)
);

CREATE TABLE UserAccount (
    email           VARCHAR(255) PRIMARY KEY,
    pwd_hash        VARCHAR(255) NOT NULL,
    user_role       VARCHAR(20) NOT NULL,
    fname           VARCHAR(50),
    lname           VARCHAR(50),
    user_phone      VARCHAR(20),
    acct_created    TIMESTAMP NOT NULL,
    employer_phone  VARCHAR(20),

    FOREIGN KEY (employer_phone)
        REFERENCES Restaurant(rest_phone)
);

CREATE TABLE Reservation (
    res_num         SERIAL PRIMARY KEY,
    party_size      INTEGER NOT NULL,
    special_req     TEXT,
    res_status      VARCHAR(20),
    res_created     TIMESTAMP NOT NULL,
    slot_date       DATE,
    slot_time       TIME,
    rest_phone      VARCHAR(20),
    email           VARCHAR(255),

    FOREIGN KEY (rest_phone)
        REFERENCES Restaurant(rest_phone),

    FOREIGN KEY (email)
        REFERENCES UserAccount(email),

    FOREIGN KEY (rest_phone, slot_date, slot_time)
        REFERENCES ReservationSlot(rest_phone, slot_date, slot_time)
);

CREATE TABLE Review (
    email           VARCHAR(255),
    rest_phone      VARCHAR(20),
    rating          INTEGER,
    comment         TEXT,
    review_created  TIMESTAMP,

    PRIMARY KEY (email, rest_phone),

    FOREIGN KEY (email)
        REFERENCES UserAccount(email),

    FOREIGN KEY (rest_phone)
        REFERENCES Restaurant(rest_phone)
);

CREATE TABLE ReservationHistory (
    res_num         INTEGER,
    changed_at      TIMESTAMP,
    changed_to      VARCHAR(20),
    changed_by      VARCHAR(255),

    PRIMARY KEY (res_num, changed_at),

    FOREIGN KEY (res_num)
        REFERENCES Reservation(res_num),

    FOREIGN KEY (changed_by)
        REFERENCES UserAccount(email)
);