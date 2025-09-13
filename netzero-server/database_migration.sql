-- SQL script to add image fields to the events table
-- Run this script to update your existing database schema

ALTER TABLE events 
ADD COLUMN thumbnail TEXT NULL COMMENT 'URL to event thumbnail image',
ADD COLUMN posterImage TEXT NULL COMMENT 'URL to event poster image', 
ADD COLUMN photos TEXT NULL COMMENT 'JSON array of event photo URLs';

-- Add indexes for better performance when filtering by image availability
CREATE INDEX idx_events_thumbnail ON events(thumbnail);
CREATE INDEX idx_events_posterImage ON events(posterImage);
CREATE INDEX idx_events_photos ON events(photos);

-- Optional: Add a comment to document the schema changes
ALTER TABLE events COMMENT = 'Events table with image support - Updated with thumbnail, posterImage, and photos fields';
