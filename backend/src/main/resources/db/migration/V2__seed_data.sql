-- Seed data: 16 real Athens, GA restaurants (matches frontend/src/mocks/restaurants.ts),
-- their operating hours, reservation slots for a rolling 60-day window, and two demo
-- accounts — so the app has real bookable data and working logins regardless of what
-- day this migration actually runs on.

INSERT INTO restaurant (rest_phone, rest_name, street, zip, city, state, cuisine, price_range, image_url, rest_created) VALUES
('706-546-7300', 'Five and Ten', '1073 S Milledge Ave', '30605', 'Athens', 'GA', 'New American', 4, '/images/FiveAndTen.jpg', CURRENT_TIMESTAMP),
('706-549-0810', 'Last Resort Grill', '184 W Clayton St', '30601', 'Athens', 'GA', 'Southern', 2, '/images/LastResortGrill.jpg', CURRENT_TIMESTAMP),
('706-549-3450', 'The National', '232 W Hancock Ave', '30601', 'Athens', 'GA', 'Mediterranean', 3, '/images/TheNational.jpg', CURRENT_TIMESTAMP),
('706-395-6125', 'South Kitchen + Bar', '247 E Washington St', '30601', 'Athens', 'GA', 'Southern', 2, '/images/SouthKitchenAndBar.jpg', CURRENT_TIMESTAMP),
('706-850-2988', 'The Place', '229 E Broad St', '30601', 'Athens', 'GA', 'Southern', 2, '/images/ThePlace.jpg', CURRENT_TIMESTAMP),
('762-316-1818', 'Osteria Olio', '355 Oneta St', '30601', 'Athens', 'GA', 'Italian', 3, '/images/OsteriaOlio.jpg', CURRENT_TIMESTAMP),
('706-395-6556', 'ZZ & Simone''s', '1540 S Lumpkin St', '30605', 'Athens', 'GA', 'Italian', 3, '/images/ZZAndSimones.jpg', CURRENT_TIMESTAMP),
('706-850-3451', 'Marker Seven Coastal Grill', '1195 S Milledge Ave', '30605', 'Athens', 'GA', 'Seafood', 3, '/images/MarkerSevenCoastalGrill.jpg', CURRENT_TIMESTAMP),
('706-395-7855', 'The Chop House', '2055 Oconee Connector', '30606', 'Athens', 'GA', 'Steakhouse', 4, '/images/TheChopHouse.jpg', CURRENT_TIMESTAMP),
('706-353-7667', 'Hilltop Grille', '2310 W Broad St', '30606', 'Athens', 'GA', 'Steakhouse', 3, '/images/HilltopGrille.jpg', CURRENT_TIMESTAMP),
('706-353-4721', 'The Globe', '199 N Lumpkin St', '30601', 'Athens', 'GA', 'Pub', 2, '/images/TheGlobe.jpg', CURRENT_TIMESTAMP),
('706-543-8997', 'Trappeze Pub', '269 N Hull St', '30601', 'Athens', 'GA', 'Pub', 2, '/images/TrappezePub.jpg', CURRENT_TIMESTAMP),
('706-543-4002', 'The World Famous', '351 N Hull St', '30601', 'Athens', 'GA', 'American', 2, '/images/TheWorldFamous.jpg', CURRENT_TIMESTAMP),
('706-207-8700', 'The Local 706', '1676 S Lumpkin St', '30605', 'Athens', 'GA', 'Gastropub', 2, '/images/TheLocal706.jpg', CURRENT_TIMESTAMP),
('678-403-3838', 'La Parrilla Mexican Restaurant', '196 Alps Rd', '30606', 'Athens', 'GA', 'Mexican', 2, '/images/LaParrillaMexicanRestaurant.jpg', CURRENT_TIMESTAMP),
('706-521-8498', 'Tikka Nation', '142 W Clayton St', '30601', 'Athens', 'GA', 'Indian', 2, '/images/TikkaNationAthens.jpg', CURRENT_TIMESTAMP);

-- Operating hours: 11:00-21:00 every day (spans both lunch and dinner slot times below).
INSERT INTO restaurant_hours (rest_phone, day_of_week, open_time, close_time, is_closed)
SELECT r.rest_phone, d.day_of_week, TIME '11:00', TIME '21:00', FALSE
FROM restaurant r
CROSS JOIN (VALUES
    ('MONDAY'), ('TUESDAY'), ('WEDNESDAY'), ('THURSDAY'), ('FRIDAY'), ('SATURDAY'), ('SUNDAY')
) AS d(day_of_week);

-- Reservation slots: lunch (11:00-14:00) and dinner (17:00-21:00) service, every 30
-- minutes, for every restaurant, for the next 60 days from whenever this migration
-- actually runs — so there's always real bookable data no matter the demo date.
INSERT INTO reservation_slot (rest_phone, slot_date, slot_time, slot_capacity)
SELECT r.rest_phone, gs.slot_date::date, t.slot_time, 24
FROM restaurant r
CROSS JOIN generate_series(CURRENT_DATE::timestamp, (CURRENT_DATE + INTERVAL '59 days')::timestamp, INTERVAL '1 day') AS gs(slot_date)
CROSS JOIN (VALUES
    (TIME '11:00'), (TIME '11:30'), (TIME '12:00'), (TIME '12:30'), (TIME '13:00'), (TIME '13:30'), (TIME '14:00'),
    (TIME '17:00'), (TIME '17:30'), (TIME '18:00'), (TIME '18:30'), (TIME '19:00'), (TIME '19:30'), (TIME '20:00'), (TIME '20:30'), (TIME '21:00')
) AS t(slot_time);

-- Demo accounts — password for both is "demo1234" (bcrypt hash below verified against
-- the app's own BCryptPasswordEncoder before being committed here). Real signup/login
-- still works for anyone else; these just guarantee a known-good login for the demo.
INSERT INTO user_account (email, pwd_hash, user_role, fname, lname, user_phone, acct_created, employer_phone) VALUES
('diner@example.com', '$2a$10$4BYz/GtBhHDIVaUfrgS1J.psSuf2z48TdiCyJVKODcKCex4ZBcYpW', 'DINER', 'Demo', 'Diner', '706-555-0100', CURRENT_TIMESTAMP, NULL),
('staff@thenational.com', '$2a$10$4BYz/GtBhHDIVaUfrgS1J.psSuf2z48TdiCyJVKODcKCex4ZBcYpW', 'STAFF', 'Demo', 'Staff', '706-549-3450', CURRENT_TIMESTAMP, '706-549-3450');
