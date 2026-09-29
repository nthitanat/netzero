-- Development-only current image fixture: event_images. Apply after canonical INSERT files.
INSERT INTO event_images (event_id, role, relative_path, mime_type, size_bytes, file_modified_ms, version) VALUES (1, 'thumbnail', 'events/thumbnail/1/thumbnail_1.png', 'image/png', 1514465, 1757763825928, 1);
INSERT INTO event_images (event_id, role, relative_path, mime_type, size_bytes, file_modified_ms, version) VALUES (1, 'poster', 'events/posterImage/1/poster_1.png', 'image/png', 1514465, 1757763825924, 1);
