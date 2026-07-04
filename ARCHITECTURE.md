# Ultimate Shooting Tracker
# System Architecture

---

# Architecture Overview

Ultimate Shooting Tracker is a modern full-stack web application built using Next.js, Supabase and OpenCV.js.

The application follows a mobile-first architecture with a serverless backend.

```
Mobile Browser
        │
        ▼
 Next.js Frontend
        │
        ▼
 Supabase
 ├── Authentication
 ├── PostgreSQL
 ├── Storage
 └── Edge Functions
        │
        ▼
 OpenCV.js
        │
        ▼
 Shot Detection
```

---

# Technology Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query

---

## Backend

Supabase

Services

- Authentication
- PostgreSQL
- Storage
- Edge Functions
- Realtime

---

## Computer Vision

OpenCV.js

Responsibilities

- Detect paper target
- Correct perspective
- Detect bullet holes
- Score shots
- Generate annotated targets

---

# Folder Structure

```
app/
components/
features/
hooks/
lib/
services/
types/
utils/
styles/
public/
```

---

# Feature Modules

Authentication

- Login
- Register
- Forgot Password

Profile

Firearms

Sessions

Camera

Scoring

Leaderboards

Competitions

Admin

Analytics

Settings

---

# Database Design

Core Tables

users

profiles

firearms

targets

sessions

shots

photos

competitions

competition_entries

leaderboards

badges

user_badges

---

# Authentication Flow

Register

↓

Verify Email

↓

Create Profile

↓

Login

↓

Dashboard

---

# User Permissions

Admin

Full Access

Trainer (future)

Can manage club members

User

Own data only

---

# Storage Structure

```
avatars/

targets/original/

targets/processed/

targets/annotated/

competition-images/
```

---

# API Structure

/api/auth

/api/firearms

/api/sessions

/api/shots

/api/targets

/api/leaderboards

/api/profile

/api/admin

---

# Deployment

GitHub

↓

GitHub Actions

↓

Vercel

↓

Supabase

---

# Design Principles

Mobile First

Offline Friendly

Fast

Responsive

Secure

Scalable

Maintainable

Accessible
