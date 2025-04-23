
# OtakuTv Database & Admin Documentation

## Overview

This document describes the recommended database schema for OtakuTv, an anime streaming and management platform with user/admin functionality.

---

## Tables Overview

### 1. `users`

- **Purpose:** Store registered user and admin data.
- **Columns:**
  - `id` (UUID, PK) – Unique user identifier.
  - `username` (String, unique, not null)
  - `email` (String, unique, not null)
  - `password_hash` (String, not null)
  - `avatar_url` (String, optional)
  - `role` (Enum: `admin`, `user`, default: `user`)
  - `created_at` (Timestamp)
  - `updated_at` (Timestamp)

### 2. `anime`

- **Purpose:** Store information for each anime show/movie.
- **Columns:**
  - `id` (UUID, PK)
  - `title` (String, not null)
  - `description` (Text)
  - `cover_image_url` (String)
  - `banner_image_url` (String)
  - `type` (Enum: `TV`, `Movie`, `OVA`, `Special`)
  - `genres` (Array of String)
  - `status` (Enum: `Airing`, `Completed`, `Upcoming`)
  - `release_date` (Date)
  - `total_episodes` (Integer)
  - `created_by` (UUID, FK: users.id)
  - `created_at` (Timestamp)
  - `updated_at` (Timestamp)

### 3. `episodes`

- **Purpose:** Store all episodes for anime.
- **Columns:**
  - `id` (UUID, PK)
  - `anime_id` (UUID, FK: anime.id)
  - `title` (String)
  - `number` (Integer, not null)
  - `description` (Text)
  - `video_url` (String)
  - `thumbnail_url` (String)
  - `duration_sec` (Integer)
  - `release_date` (Date)
  - `created_at` (Timestamp)
  - `updated_at` (Timestamp)

### 4. `favorites`

- **Purpose:** Track which anime a user has favorited.
- **Columns:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK: users.id)
  - `anime_id` (UUID, FK: anime.id)
  - `created_at` (Timestamp)

### 5. `watch_progress`

- **Purpose:** Store current episode/position for resume watching.
- **Columns:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK: users.id)
  - `anime_id` (UUID, FK: anime.id)
  - `episode_id` (UUID, FK: episodes.id)
  - `position_sec` (Integer, default: 0)
  - `updated_at` (Timestamp)

---

## Relationships

- `users` (1:many) → `anime` via `created_by` (admin feature)
- `anime` (1:many) → `episodes`
- `users` (many:many) ↔ `anime` via `favorites`
- `users` (many) ↔ `anime` via `watch_progress`

---

## Indexes & Constraints

- Unique constraints on `username` and `email` in `users`
- Compound unique index on (`user_id`, `anime_id`) for `favorites`
- Compound unique index on (`user_id`, `anime_id`) for `watch_progress`
- Foreign keys as described

---

## Admin Features

- Add/edit/delete anime
- Add/edit/delete episodes
- Manage users and roles (admin/user)
- Monitor favorites and watch progress for reports

---

## Recommended Extensions (if using Postgres):

- `uuid-ossp` (for UUID keys)
- Consider `pg_trgm` for fast text search on anime titles/descriptions

---

## Note

- **No backend/database is configured yet.** Once you set up a backend (e.g., Supabase/Postgres) you should implement these tables/relations and update this file if your schema changes.
- See Lovable docs for integrating Supabase: https://docs.lovable.dev/integrations/supabase/

