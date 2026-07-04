# Ultimate Shooting Tracker
## Project Specification (Version 1.0)

---

# Overview

Ultimate Shooting Tracker is a modern web application that allows shooters to automatically score paper targets using a mobile phone camera.

The application uses computer vision to detect bullet holes, calculate shot placement, determine accuracy, score each shot, and provide long-term performance analytics.

The application is designed for:

- Recreational shooters
- Sport shooters
- Shooting clubs
- Competition shooters
- Firearm instructors

The goal is to create the most advanced shooting performance tracker available.

---

# Primary Objectives

The application must:

- Detect paper targets automatically
- Detect bullet holes automatically
- Score every shot automatically
- Store every shooting session
- Track long-term improvement
- Display public leaderboards
- Support competitions
- Work on desktop and mobile
- Be deployable on Vercel

---

# Technology Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend

- Supabase
- PostgreSQL
- Storage
- Authentication
- Edge Functions

Deployment

- GitHub
- GitHub Actions
- Vercel

Computer Vision

- OpenCV.js
- WebAssembly

Future AI

- TensorFlow.js
- ONNX Runtime

---

# Authentication

Use Supabase Authentication.

Support:

- Email signup
- Email login
- Password reset

Future

- Google Login
- Apple Login

---

# User Roles

## Administrator

Administrators have unrestricted access.

Permissions

- View all users
- Edit all users
- Delete users
- Disable users
- Reset passwords
- Assign roles
- Manage competitions
- Manage leaderboards
- Manage targets
- Manage firearm templates
- View all shooting sessions
- View analytics
- Manage system settings

---

## Standard User

Users can only manage their own information.

Permissions

- Edit profile
- Upload profile picture
- Create shooting sessions
- Edit own sessions
- Delete own sessions
- Manage firearms
- Upload target images
- View statistics
- Join competitions
- View public leaderboards

Users may NOT

- Edit other users
- Delete other users
- View other users' private sessions
- View private target images
- Access admin pages

---

# User Profile

Each user should contain

- First Name
- Last Name
- Username
- Email
- Country
- Province / State
- Shooting Club
- Profile Picture
- Join Date
- Role

---

# Firearms

Users can manage multiple firearms.

Each firearm contains

- Manufacturer
- Model
- Calibre
- Firearm Type
- Sight Type
- Optic
- Notes

Firearm Types

- Handgun
- Rifle
- Shotgun
- Air Rifle
- Air Pistol

---

# Shooting Session

Every session contains

General

- Date
- Time
- Indoor / Outdoor
- Weather
- Wind
- Notes

Firearm

- Firearm Used

Distance

The shooting distance MUST be stored.

Supported distances

- 5m
- 7m
- 10m
- 15m
- 20m
- 25m
- 50m
- 100m
- 200m
- 300m
- Custom Distance

Target

- Bullseye
- NRA
- IPSC
- IDPA
- USPSA
- Steel
- Custom

Course of Fire

- Practice
- Competition
- Qualification
- Training

Number of Shots

---

# Camera Scoring

Workflow

1. Capture clean target
2. Capture target after shooting
3. Detect target
4. Correct image perspective
5. Crop target
6. Detect new bullet holes
7. Calculate coordinates
8. Score each shot
9. Generate annotated target
10. Save session

---

# Shot Information

Every shot contains

- Shot Number
- X Coordinate
- Y Coordinate
- Distance from Centre
- Ring Hit
- Score
- Timestamp

---

# Statistics

Per Session

- Average Score
- Highest Score
- Lowest Score
- Group Size
- Extreme Spread
- Mean Radius
- Accuracy Percentage
- Hit Percentage

Lifetime

- Total Sessions
- Total Shots
- Best Session
- Average Accuracy
- Favourite Firearm
- Favourite Distance
- Favourite Target

---

# Public Leaderboards

Leaderboards are PUBLIC to all authenticated users.

Every user should be able to compare themselves against every other shooter.

Users CAN view

- Username
- Profile Picture
- Country
- Club
- Accuracy
- Average Score
- Rank
- Badges
- Trend (Up/Down)
- Sessions Completed

Users CANNOT view

- Private notes
- Target photos
- Firearm serial numbers
- Detailed shot locations
- Email addresses

---

# Leaderboards

Leaderboards should exist for

## Distance

- 5m
- 7m
- 10m
- 15m
- 20m
- 25m
- 50m
- 100m
- 200m
- 300m

---

## Firearm Type

- Handgun
- Rifle
- Shotgun
- Air Rifle
- Air Pistol

---

## Target Type

- Bullseye
- NRA
- IPSC
- IDPA
- USPSA

---

## Time Period

- Weekly
- Monthly
- Yearly
- All Time

---

## Geographic

Future

- Global
- Country
- Province
- Club

---

# Ranking Rules

Leaderboard rankings should NOT be based on a single lucky session.

Rankings should use

- Minimum qualifying sessions
- Minimum number of shots
- Average of recent qualifying sessions
- Automatic recalculation after every qualifying session

---

# Competitions

Users can join competitions.

Competition fields

- Name
- Description
- Start Date
- End Date
- Distance
- Target Type
- Number of Shots
- Rules

Competition leaderboard updates automatically.

---

# Achievements

Examples

- First Bullseye
- First Competition
- 100 Shots
- 500 Shots
- 1000 Shots
- Perfect Session
- Top 10 Shooter
- Top Shooter at 25m
- Weekly Champion
- Monthly Champion

---

# Notifications

Future

- New Personal Best
- Rank Improved
- Competition Started
- Competition Ending Soon
- New Badge Earned

---

# Database

Tables

users

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

# Storage

Supabase Storage

Store

- Original target images
- Processed images
- Annotated targets
- Profile pictures

---

# Security

Implement Row Level Security.

Users may only modify

- Their own profile
- Their own firearms
- Their own sessions
- Their own photos

Leaderboards should be readable by every authenticated user.

Admins have unrestricted access.

---

# Admin Dashboard

Features

- User Management
- Competition Management
- Leaderboards
- Analytics
- Target Management
- Firearm Templates
- System Settings
- Audit Logs

---

# Future Features

- AI Shooting Coach
- Live Shot Detection
- Bluetooth Shot Timer Integration
- Smart Watches
- Apple Health
- Google Fit
- PDF Scorecards
- Session Sharing
- Friends
- Teams
- Clubs
- Match Invitations
- Offline Mode
- Cloud Sync
- Dark Mode
- Multiple Languages

---

# Application Design Goals

The application should feel modern, fast and professional.

Design inspiration

- Garmin Connect
- Strava
- MyFitnessPal
- PractiScore
- Apple Fitness
- Tesla UI

The interface should be clean, responsive and mobile-first.

---

# Development Roadmap

## Phase 1

- Authentication
- User Profiles
- Firearms
- Sessions
- Camera
- Image Upload
- Database

---

## Phase 2

- OpenCV Target Detection
- Perspective Correction
- Bullet Hole Detection
- Automatic Scoring

---

## Phase 3

- Statistics
- Charts
- Performance History

---

## Phase 4

- Public Leaderboards
- Competitions
- Achievements

---

## Phase 5

- AI Shooting Coach
- Live Detection
- Advanced Analytics

---

# End Goal

Build the world's best shooting analytics platform that automatically scores paper targets using only a mobile phone camera while providing shooters with detailed performance analytics, competitions, achievements and global leaderboards.
