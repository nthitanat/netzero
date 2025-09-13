# Events Table Structure

## Complete Table Schema

| Column Name | Data Type | Constraints | Default | Description |
|-------------|-----------|-------------|---------|-------------|
| `id` | INT(11) | PRIMARY KEY, AUTO_INCREMENT | - | Unique event identifier |
| `title` | VARCHAR(255) | NOT NULL | - | Event title |
| `description` | TEXT | - | NULL | Event description |
| `event_date` | DATETIME | NOT NULL | - | Date and time of the event |
| `location` | VARCHAR(255) | NOT NULL | - | Event location |
| `category` | VARCHAR(100) | NOT NULL | - | Event category |
| `organizer` | VARCHAR(255) | NOT NULL | - | Event organizer name |
| `contact_email` | VARCHAR(255) | NOT NULL | - | Organizer contact email |
| `contact_phone` | VARCHAR(20) | - | NULL | Organizer contact phone |
| `max_participants` | INT(11) | NOT NULL | 0 | Maximum number of participants |
| `current_participants` | INT(11) | NOT NULL | 0 | Current number of registered participants |
| `registration_deadline` | DATETIME | NOT NULL | - | Registration deadline |
| `status` | ENUM | NOT NULL | 'active' | Event status (active, inactive, cancelled, completed) |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | Record update timestamp |

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `PRIMARY` | `id` | PRIMARY | Primary key |
| `idx_event_date` | `event_date` | INDEX | Filter by event date |
| `idx_category` | `category` | INDEX | Filter by category |
| `idx_status` | `status` | INDEX | Filter by status |
| `idx_location` | `location` | INDEX | Filter by location |
| `idx_organizer` | `organizer` | INDEX | Filter by organizer |
| `idx_registration_deadline` | `registration_deadline` | INDEX | Filter by deadline |
| **`idx_events_thumbnail`** | **`thumbnail(255)`** | **INDEX** | **🆕 Image availability queries** |
| **`idx_events_posterImage`** | **`posterImage(255)`** | **INDEX** | **🆕 Image availability queries** |
| **`idx_events_photos`** | **`photos(255)`** | **INDEX** | **🆕 Photo availability queries** |

## New Image Fields Details

### `thumbnail` Field
- **Type**: TEXT
- **Purpose**: Stores the full URL to the event thumbnail image
- **Example**: `http://localhost:3000/api/v1/events/images/events/thumbnail/1/thumb_1694623456789.jpg`
- **Usage**: Small preview image for event cards/lists

### `posterImage` Field  
- **Type**: TEXT
- **Purpose**: Stores the full URL to the event poster/banner image
- **Example**: `http://localhost:3000/api/v1/events/images/events/posterImage/1/poster_1694623456789.png`
- **Usage**: Large promotional image for event details

### `photos` Field
- **Type**: TEXT (stores JSON)
- **Purpose**: Stores a JSON array of photo URLs
- **Example**: `["http://localhost:3000/api/v1/events/images/events/photos/1/photo1_1694623456789.jpg", "http://localhost:3000/api/v1/events/images/events/photos/1/photo2_1694623456789.jpg"]`
- **Usage**: Gallery of event photos (venue, past events, etc.)

## Sample Data

```sql
-- Example of how data looks in the table
SELECT 
  id,
  title,
  thumbnail,
  posterImage,
  photos,
  status,
  created_at
FROM events 
WHERE id = 1;

-- Sample result:
-- +----+------------------------+--------------------------------------------------+----------------------------------------------------+--------------------------------------------------+--------+---------------------+
-- | id | title                  | thumbnail                                        | posterImage                                        | photos                                           | status | created_at          |
-- +----+------------------------+--------------------------------------------------+----------------------------------------------------+--------------------------------------------------+--------+---------------------+
-- | 1  | Sample Event           | http://localhost:3000/api/v1/events/images/...  | http://localhost:3000/api/v1/events/images/...    | ["http://localhost:3000/api/v1/events/images... | active | 2025-09-13 10:30:00 |
-- +----+------------------------+--------------------------------------------------+----------------------------------------------------+--------------------------------------------------+--------+---------------------+
```

## Migration Notes

If you have an existing `events` table, run this migration:

```sql
-- Add new image fields to existing table
ALTER TABLE events 
ADD COLUMN thumbnail TEXT NULL COMMENT 'URL to event thumbnail image',
ADD COLUMN posterImage TEXT NULL COMMENT 'URL to event poster image', 
ADD COLUMN photos TEXT NULL COMMENT 'JSON array of event photo URLs';

-- Add indexes for better performance
CREATE INDEX idx_events_thumbnail ON events(thumbnail(255));
CREATE INDEX idx_events_posterImage ON events(posterImage(255));
CREATE INDEX idx_events_photos ON events(photos(255));
```

## File Storage Structure

The actual image files are stored in the filesystem:

```
files/
└── events/
    ├── thumbnail/
    │   ├── 1/           # Event ID 1
    │   │   ├── thumb_1694623456789.jpg
    │   │   └── thumb_1694623456790.png
    │   ├── 2/           # Event ID 2
    │   │   └── thumb_1694623456791.jpg
    │   └── ...
    ├── posterImage/
    │   ├── 1/
    │   │   └── poster_1694623456789.png
    │   ├── 2/
    │   │   └── poster_1694623456792.jpg
    │   └── ...
    └── photos/
        ├── 1/
        │   ├── photo1_1694623456789.jpg
        │   ├── photo2_1694623456790.jpg
        │   └── photo3_1694623456791.jpg
        ├── 2/
        │   └── photo1_1694623456792.jpg
        └── ...
```

## Database Engine & Charset

- **Engine**: InnoDB (supports transactions, foreign keys)
- **Charset**: utf8mb4 (full Unicode support including emojis)
- **Collation**: utf8mb4_unicode_ci (case-insensitive Unicode collation)
