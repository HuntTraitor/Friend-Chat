-- Do not delete this table
DROP TABLE IF EXISTS member_friend CASCADE;
DROP TABLE IF EXISTS post CASCADE;
DROP TABLE IF EXISTS member CASCADE;
CREATE TABLE member(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);
CREATE TABLE post(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), member_id UUID REFERENCES member(id), data jsonb);
CREATE TABLE member_friend(member_id UUID REFERENCES member(id), friend_id UUID REFERENCES member(id), accepted boolean, CONSTRAINT member_friend_unique_pair CHECK (member_id <> friend_id), UNIQUE (member_id, friend_id));


-- Your schema DDL (create table statements etc.) from Assignment 1 goes below here 