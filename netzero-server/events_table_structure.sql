-- Complete Events Table Structure
-- This shows the full table schema that matches the Event model

CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` datetime NOT NULL,
  `location` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `organizer` varchar(255) NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `contact_phone` varchar(20),
  `max_participants` int(11) NOT NULL DEFAULT 0,
  `current_participants` int(11) NOT NULL DEFAULT 0,
  `registration_deadline` datetime NOT NULL,
  `status` enum('active','inactive','cancelled','completed') NOT NULL DEFAULT 'active',
  `thumbnail` text COMMENT 'URL to event thumbnail image',
  `posterImage` text COMMENT 'URL to event poster image',
  `photos` text COMMENT 'JSON array of event photo URLs',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_location` (`location`),
  KEY `idx_organizer` (`organizer`),
  KEY `idx_registration_deadline` (`registration_deadline`),
  KEY `idx_events_thumbnail` (`thumbnail`(255)),
  KEY `idx_events_posterImage` (`posterImage`(255)),
  KEY `idx_events_photos` (`photos`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Events table with image support';

-- Sample data structure showing how the new image fields work
INSERT INTO `events` (
  `title`,
  `description`, 
  `event_date`,
  `location`,
  `category`,
  `organizer`,
  `contact_email`,
  `contact_phone`,
  `max_participants`,
  `current_participants`,
  `registration_deadline`,
  `status`,
  `thumbnail`,
  `posterImage`,
  `photos`
) VALUES (
  'Sample Event with Images',
  'This is a sample event showing how images are stored',
  '2025-12-01 10:00:00',
  'Conference Hall A',
  'Technology',
  'Event Organizer',
  'organizer@example.com',
  '+1234567890',
  100,
  25,
  '2025-11-25 23:59:59',
  'active',
  'http://localhost:3000/api/v1/events/images/events/thumbnail/1/thumb_1694623456789.jpg',
  'http://localhost:3000/api/v1/events/images/events/posterImage/1/poster_1694623456789.png',
  '["http://localhost:3000/api/v1/events/images/events/photos/1/photo1_1694623456789.jpg", "http://localhost:3000/api/v1/events/images/events/photos/1/photo2_1694623456789.jpg", "http://localhost:3000/api/v1/events/images/events/photos/1/photo3_1694623456789.jpg"]'
);
