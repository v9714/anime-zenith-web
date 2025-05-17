
# Anime Streaming Platform Database Schema

This document outlines the database schema for the anime streaming application.

## Overview

The database is designed to support:
- User accounts and authentication
- Anime content management
- User interactions (likes, comments, watchlists)
- Watch history and progress tracking
- Content recommendations

## Tables and Relationships

### Users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed user password |
| display_name | VARCHAR(100) | NOT NULL | User's display name |
| avatar_url | VARCHAR(255) | | URL to user's avatar image |
| is_premium | BOOLEAN | DEFAULT FALSE | Whether user has premium subscription |
| is_admin | BOOLEAN | DEFAULT FALSE | Whether user has admin privileges |
| created_at | TIMESTAMP | DEFAULT NOW() | When the user account was created |
| last_login | TIMESTAMP | | When the user last logged in |

### Anime

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier for the anime |
| title | VARCHAR(255) | NOT NULL | Primary title of the anime |
| alternative_titles | JSONB | | Alternative titles in different languages |
| description | TEXT | | Description/synopsis of the anime |
| cover_image | VARCHAR(255) | | URL to cover image |
| banner_image | VARCHAR(255) | | URL to banner image |
| year | INTEGER | | Release year |
| season | VARCHAR(20) | | Season of release (Winter, Spring, Summer, Fall) |
| status | VARCHAR(20) | | Status (Ongoing, Completed, Upcoming) |
| type | VARCHAR(20) | | Type (TV, Movie, OVA, etc.) |
| rating | DECIMAL(3,1) | | Average user rating |
| votes_count | INTEGER | DEFAULT 0 | Number of user votes |
| studio | VARCHAR(100) | | Animation studio |
| episode_duration | VARCHAR(50) | | Average duration per episode |
| created_at | TIMESTAMP | DEFAULT NOW() | When the record was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | When the record was last updated |

### Episodes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier for the episode |
| anime_id | INTEGER | FOREIGN KEY (anime.id) | Reference to the anime |
| title | VARCHAR(255) | | Title of the episode |
| episode_number | INTEGER | NOT NULL | Episode number |
| thumbnail | VARCHAR(255) | | URL to episode thumbnail |
| video_url | VARCHAR(255) | | URL to video file |
| duration | INTEGER | | Duration in seconds |
| description | TEXT | | Episode description |
| air_date | DATE | | Original air date |
| created_at | TIMESTAMP | DEFAULT NOW() | When the record was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | When the record was last updated |

### Genres

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unique identifier for the genre |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Name of the genre |

### AnimeGenres

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| anime_id | INTEGER | FOREIGN KEY (anime.id), PRIMARY KEY | Reference to the anime |
| genre_id | INTEGER | FOREIGN KEY (genres.id), PRIMARY KEY | Reference to the genre |

### WatchHistory

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the history entry |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Reference to the user |
| anime_id | INTEGER | FOREIGN KEY (anime.id), NOT NULL | Reference to the anime |
| episode_id | INTEGER | FOREIGN KEY (episodes.id), NOT NULL | Reference to the episode |
| timestamp | INTEGER | NOT NULL | Last watched position in seconds |
| duration | INTEGER | NOT NULL | Total duration of the episode in seconds |
| watched_percentage | DECIMAL(5,2) | | Percentage of episode watched |
| completed | BOOLEAN | DEFAULT FALSE | Whether the episode was completed |
| created_at | TIMESTAMP | DEFAULT NOW() | When the history was first created |
| updated_at | TIMESTAMP | DEFAULT NOW() | When the history was last updated |

### UserLikes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the like |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Reference to the user |
| content_type | VARCHAR(20) | NOT NULL | Type of content (anime, episode) |
| content_id | INTEGER | NOT NULL | ID of the liked content |
| created_at | TIMESTAMP | DEFAULT NOW() | When the like was created |

### UserBookmarks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the bookmark |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Reference to the user |
| anime_id | INTEGER | FOREIGN KEY (anime.id), NOT NULL | Reference to the anime |
| created_at | TIMESTAMP | DEFAULT NOW() | When the bookmark was created |

### Comments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the comment |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Reference to the user |
| content_type | VARCHAR(20) | NOT NULL | Type of content (anime, episode) |
| content_id | INTEGER | NOT NULL | ID of the commented content |
| parent_id | UUID | FOREIGN KEY (comments.id) | Reference to parent comment for replies |
| content | TEXT | NOT NULL | Comment content |
| likes_count | INTEGER | DEFAULT 0 | Number of likes on the comment |
| created_at | TIMESTAMP | DEFAULT NOW() | When the comment was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | When the comment was last updated |

### Playlists

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the playlist |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Reference to the user |
| name | VARCHAR(100) | NOT NULL | Name of the playlist |
| description | TEXT | | Description of the playlist |
| is_public | BOOLEAN | DEFAULT FALSE | Whether the playlist is public |
| created_at | TIMESTAMP | DEFAULT NOW() | When the playlist was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | When the playlist was last updated |

### PlaylistItems

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the playlist item |
| playlist_id | UUID | FOREIGN KEY (playlists.id), NOT NULL | Reference to the playlist |
| anime_id | INTEGER | FOREIGN KEY (anime.id) | Reference to the anime |
| episode_id | INTEGER | FOREIGN KEY (episodes.id) | Reference to the episode |
| position | INTEGER | | Position in the playlist |
| added_at | TIMESTAMP | DEFAULT NOW() | When the item was added |

### VideoSources

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the video source |
| episode_id | INTEGER | FOREIGN KEY (episodes.id), NOT NULL | Reference to the episode |
| quality | VARCHAR(20) | NOT NULL | Video quality (480p, 720p, 1080p, etc.) |
| format | VARCHAR(20) | NOT NULL | File format (mp4, webm, etc.) |
| url | VARCHAR(255) | NOT NULL | URL to the video file |
| is_dub | BOOLEAN | DEFAULT FALSE | Whether this is a dubbed version |
| language | VARCHAR(50) | NOT NULL | Audio language |
| created_at | TIMESTAMP | DEFAULT NOW() | When the record was created |

### Subtitles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the subtitle |
| episode_id | INTEGER | FOREIGN KEY (episodes.id), NOT NULL | Reference to the episode |
| language | VARCHAR(50) | NOT NULL | Subtitle language |
| url | VARCHAR(255) | NOT NULL | URL to the subtitle file |
| format | VARCHAR(20) | NOT NULL | Format (vtt, srt, etc.) |
| created_at | TIMESTAMP | DEFAULT NOW() | When the record was created |

### UserRatings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the rating |
| user_id | UUID | FOREIGN KEY (users.id), NOT NULL | Reference to the user |
| anime_id | INTEGER | FOREIGN KEY (anime.id), NOT NULL | Reference to the anime |
| rating | INTEGER | NOT NULL | User rating (1-10) |
| review | TEXT | | Optional review text |
| created_at | TIMESTAMP | DEFAULT NOW() | When the rating was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | When the rating was last updated |

### UserPreferences

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | FOREIGN KEY (users.id), PRIMARY KEY | Reference to the user |
| preferred_language | VARCHAR(50) | | Preferred audio language |
| preferred_subtitle | VARCHAR(50) | | Preferred subtitle language |
| autoplay_next | BOOLEAN | DEFAULT TRUE | Whether to autoplay next episode |
| default_quality | VARCHAR(20) | DEFAULT '720p' | Default video quality |
| theme | VARCHAR(20) | DEFAULT 'dark' | UI theme preference |
| updated_at | TIMESTAMP | DEFAULT NOW() | When preferences were last updated |

## Indexes

For better performance, the following indexes should be created:

1. `watch_history_user_idx` on `WatchHistory(user_id)` 
2. `comments_content_idx` on `Comments(content_type, content_id)`
3. `anime_title_idx` on `Anime(title)` using GIN for text search
4. `user_likes_idx` on `UserLikes(user_id, content_type, content_id)`
5. `episodes_anime_idx` on `Episodes(anime_id, episode_number)`

## Relationships Diagram

```
Users 1:N WatchHistory
Users 1:N UserLikes
Users 1:N UserBookmarks
Users 1:N Comments
Users 1:N Playlists
Users 1:N UserRatings
Users 1:1 UserPreferences

Anime 1:N Episodes
Anime N:M Genres (via AnimeGenres)
Anime 1:N UserBookmarks
Anime 1:N UserRatings

Episodes 1:N WatchHistory
Episodes 1:N VideoSources
Episodes 1:N Subtitles

Playlists 1:N PlaylistItems

Comments 1:N Comments (self-referencing for replies)
```

## Notes on Implementation

1. **Authentication**: Implement with JWT or OAuth for secure authentication.
2. **Real-time Features**: For real-time comments or watch-together features, consider a WebSocket service.
3. **Content Delivery**: Store video files in a dedicated CDN for better streaming performance.
4. **Watch Progress**: Watch history should update periodically (e.g., every 10-15 seconds) and when a user pauses or exits.
5. **Search**: Consider adding full-text search capabilities for anime titles and descriptions.
6. **Permissions**: Implement row-level security to ensure users can only access their own data.
7. **Caching**: Implement caching for frequently accessed data like popular anime or user watch history.

## Additional Features

For future implementation:
1. Payment and subscription management tables
2. Recommendation system tables
3. Notification system
4. User activity/audit logs
5. Social features (friends, sharing)
