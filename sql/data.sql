-- This file is not included in the submission archive, anything you do here is just for manual "testing" via the Swagger UI --

----- Your insert statements go below here -----
INSERT INTO member(id, data) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095287', jsonb_build_object('email','molly@books.com','name','Molly Member','pwhash',crypt('mollymember','cs'),'roles','["member"]'));
INSERT INTO member(id, data) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095288', jsonb_build_object('email','hunter@books.com','name','Hunter Member','pwhash',crypt('huntermember','cs'),'roles','["member"]'));
INSERT INTO member(id, data) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095289', jsonb_build_object('email','tanya@books.com','name','Tanya Member','pwhash',crypt('tanyamember','cs'),'roles','["member"]'));
INSERT INTO member(id, data) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095277', jsonb_build_object('email','meadow@books.com','name','Meadow Member','pwhash',crypt('meadowmember','cs'),'roles','["member"]'));
INSERT INTO member(id, data) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095211', jsonb_build_object('email','vinnie@books.com','name','Vinnie Member','pwhash',crypt('vinniemember','cs'),'roles','["member"]'));
INSERT INTO member_friend(member_id, friend_id, accepted) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095288', '6f18ee64-d861-41f3-9a10-308cf3095289', true);
INSERT INTO member_friend(member_id, friend_id, accepted) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095288', '6f18ee64-d861-41f3-9a10-308cf3095277', true);
INSERT INTO member_friend(member_id, friend_id, accepted) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095288', '6f18ee64-d861-41f3-9a10-308cf3095287', false);
INSERT INTO member_friend(member_id, friend_id, accepted) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095211', '6f18ee64-d861-41f3-9a10-308cf3095288', false);
INSERT INTO post(member_id, data) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095288', jsonb_build_object('posted', current_timestamp, 'content', 'Hello all! I am super cool :D', 'image', 'https://image1.com'));
INSERT INTO post(member_id, data) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095277', jsonb_build_object('posted', current_timestamp, 'content', 'Hello all! My name is meadow im gonna be a professor!', 'image', 'https://image2.com'));
INSERT INTO post(member_id, data) VALUES ('6f18ee64-d861-41f3-9a10-308cf3095289', jsonb_build_object('posted', current_timestamp, 'content', 'Hello all! My name is tanya and im just a girl...', 'image', 'https://image3.com'));