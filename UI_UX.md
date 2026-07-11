# Ultimate Shooting Tracker
# UI/UX Design System

---

# Design Philosophy

The Ultimate Shooting Tracker follows a **mobile-first**, **data-driven** design philosophy with three core principles:

1. **Selection over Typing** — Users select from predefined lists to ensure data consistency
2. **Guided Workflows** — Complex tasks like shooting sessions follow wizard patterns
3. **Instant Feedback** — Statistics, leaderboards, and achievements update immediately

---

# Color Palette

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--brand-primary` | `#1a56db` | Primary buttons, links, active states |
| `--brand-primary-dark` | `#1e40af` | Hover states |
| `--brand-primary-light` | `#dbeafe` | Backgrounds, selections |
| `--brand-accent` | `#e11d48` | Danger, alerts, competition highlight |
| `--brand-success` | `#16a34a` | Completed, perfect score, X-ring |
| `--brand-warning` | `#d97706` | Validation warnings, pending states |

## Neutral Colors

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg-primary` | `#ffffff` | `#0f172a` | Page backgrounds |
| `--bg-secondary` | `#f8fafc` | `#1e293b` | Card backgrounds |
| `--bg-tertiary` | `#f1f5f9` | `#334155` | Input, hover states |
| `--text-primary` | `#0f172a` | `#f1f5f9` | Primary text |
| `--text-secondary` | `#64748b` | `#94a3b8` | Secondary text |
| `--text-muted` | `#94a3b8` | `#64748b` | Placeholder, disabled |
| `--border` | `#e2e8f0` | `#334155` | Borders, dividers |

## Shooting-Specific Colors

| Token | Hex | Usage |
|---|---|---|
| `--score-perfect` | `#fbbf24` | Gold for X-ring / 10 |
| `--score-high` | `#22c55e` | Green for 8-9 |
| `--score-mid` | `#3b82f6` | Blue for 5-7 |
| `--score-low` | `#ef4444` | Red for 1-4 |
| `--score-miss` | `#6b7280` | Gray for misses |
| `--target-black` | `#1a1a1a` | Target center black |
| `--target-white` | `#f5f5f5` | Target outer white |

---

# Typography

## Font Family

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

## Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--text-xs` | 0.75rem (12px) | 400 | 1.5 | Captions, metadata |
| `--text-sm` | 0.875rem (14px) | 400 | 1.5 | Body secondary |
| `--text-base` | 1rem (16px) | 400 | 1.5 | Body primary |
| `--text-lg` | 1.125rem (18px) | 500 | 1.4 | Card titles |
| `--text-xl` | 1.25rem (20px) | 600 | 1.3 | Section headers |
| `--text-2xl` | 1.5rem (24px) | 700 | 1.2 | Page headers |
| `--text-3xl` | 1.875rem (30px) | 700 | 1.1 | Hero text |
| `--text-4xl` | 2.25rem (36px) | 800 | 1.1 | Dashboard stats |

## Number/Monospace

Scores, distances, and statistical data use monospace for alignment:

```css
.stat-value {
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: -0.02em;
}
```

---

# Spacing

| Token | Value |
|---|---|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-3` | 0.75rem (12px) |
| `--space-4` | 1rem (16px) |
| `--space-5` | 1.25rem (20px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |
| `--space-10` | 2.5rem (40px) |
| `--space-12` | 3rem (48px) |
| `--space-16` | 4rem (64px) |

## Layout Grid

- **Mobile**: 4-column grid, 16px gutter
- **Tablet**: 8-column grid, 24px gutter
- **Desktop**: 12-column grid, 24px gutter
- **Max content width**: 1280px
- **Side margins**: 16px mobile, 24px tablet, 32px desktop

---

# Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Small tags, badges |
| `--radius-md` | 8px | Cards, inputs, buttons |
| `--radius-lg` | 12px | Modals, bottom sheets |
| `--radius-xl` | 16px | Large containers |
| `--radius-full` | 9999px | Avatars, pills |

---

# Shadows

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` | Cards subtle |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | `0 4px 6px rgba(0,0,0,0.4)` | Elevated cards |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | `0 10px 15px rgba(0,0,0,0.5)` | Modals, dropdowns |

---

# Component Library

## Buttons

### Primary Button
```
┌──────────────────────────┐
│  New Shooting Session     │
└──────────────────────────┘
```
- Background: `--brand-primary`
- Text: White
- Padding: 12px 24px
- Border radius: `--radius-md`
- Font weight: 600
- Icon left-aligned when present

### Secondary Button
```
┌──────────────────────────┐
│  Cancel                   │
└──────────────────────────┘
```
- Border: 1px solid `--border`
- Text: `--text-primary`

### Ghost Button
```
┌──────────────────────────┐
│  Edit                     │
└──────────────────────────┘
```
- No background until hover
- Hover: `--bg-tertiary`

### Icon Button
```
┌────┐
│  ⚙ │
└────┘
```
- 40px x 40px square
- Used for toolbar actions

### FAB (Mobile)
```
    ┌──┐
    │＋│
    └──┘
```
- 56px circle
- Positioned bottom-right
- `--brand-primary` background

---

## Form Elements

### Text Input
```
┌──────────────────────────────┐
│  Label                        │
│ ┌──────────────────────────┐  │
│ │ Placeholder text...      │  │
│ └──────────────────────────┘  │
│  Helper text                  │
└──────────────────────────────┘
```
- Height: 44px (touch target)
- Border: 1px solid `--border`
- Focus: 2px solid `--brand-primary`
- Error: 2px solid `--brand-accent`
- Border radius: `--radius-md`

### Searchable Dropdown (Combobox)
```
┌──────────────────────────────┐
│  Select Shooting Range   ▼   │
├──────────────────────────────┤
│  🔍 Search ranges...         │
├──────────────────────────────┤
│  ○ Magnum United             │
│  ○ False Bay Sport           │
│  ○ Pretoria Shooting Club    │
│  ○ ...                       │
├──────────────────────────────┤
│  Request new range           │
└──────────────────────────────┘
```
- Trigger button shows selected value or placeholder
- Dropdown with search input at top
- Filtered list of options
- "Request new" link at bottom for non-admin users
- Keyboard navigable (arrow keys, enter)
- Mobile: renders as bottom sheet

### Numeric Input
```
┌──────────────────────────────┐
│  Expected Number of Shots    │
│ ┌──────────────────────────┐  │
│ │  ─  10  ＋               │  │
│ └──────────────────────────┘  │
└──────────────────────────────┘
```
- Stepper controls (minus/plus) on each side
- Manual entry also allowed
- Min/max validation

---

## Cards

### Stat Card
```
┌──────────────────────────┐
│                          │
│  ┌──┐                    │
│  │  │  Total Shots       │
│  └──┘                    │
│                          │
│     1,247               │
│     ↑ 12% this month    │
│                          │
└──────────────────────────┘
```
- Icon top-left
- Label secondary
- Value large monospace
- Trend indicator

### Session Card
```
┌──────────────────────────────────┐
│ 📍 Magnum United Range          │
│ 🔫 Glock 19 · 9mm · 10m        │
│ ─────────────────────────────── │
│ 🎯 Score: 95/100   Accuracy: 95%│
│ 📅 5 Jul 2026 · 14:30          │
│ ┌────────────────────────────┐  │
│ │  [Annotated Target Image]  │  │
│ └────────────────────────────┘  │
└──────────────────────────────────┘
```
- Range and firearm info
- Score and accuracy prominently displayed
- Thumbnail of annotated target
- Date and time

---

## Navigation

### Bottom Tab Bar (Mobile)
```
┌──────────────────────────────────────────┐
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │      │  │      │  │      │  │      │ │
│  │ Home │  │ Guns │  │  ＋  │  │ Stats│ │
│  │      │  │      │  │      │  │      │ │
│  └──────┘  └──────┘  └──────┘  └──────┘ │
│                                          │
└──────────────────────────────────────────┘
```
- 4 tabs: Home, Firearms, New Session (center FAB), Statistics
- Active tab: `--brand-primary` icon + text
- Inactive: `--text-muted`

### Sidebar Navigation (Desktop)
```
┌──────────┬──────────────────────────────┐
│  🎯      │                              │
│  Logo    │   Page Content                │
│          │                              │
│  🏠 Home │                              │
│  🔫 Guns │                              │
│  📋 Sessions│                           │
│  📊 Stats │                              │
│  🏆 Leaderboards│                       │
│  🎯 Competitions│                       │
│  ⚙ Settings│                            │
│          │                              │
│  ─────── │                              │
│  👤 Profile│                            │
│          │                              │
└──────────┴──────────────────────────────┘
```
- 240px wide
- Collapsible to icon-only on smaller screens
- Active item highlighted

---

# Page Layouts

## 1. Login / Register Pages

```
┌───────────────────────────┐
│                           │
│        🎯                 │
│   Ultimate Shooting       │
│        Tracker            │
│                           │
│  ┌─────────────────────┐  │
│  │ Email                │  │
│  └─────────────────────┘  │
│  ┌─────────────────────┐  │
│  │ Password             │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │  Sign In             │  │
│  └─────────────────────┘  │
│                           │
│  Don't have an account?   │
│  Create Account           │
│                           │
└───────────────────────────┘
```
- Centered card layout
- Max width: 400px
- Full-screen on mobile
- App logo at top

---

## 2. User Dashboard

```
┌──────────────────────────────────────────────────┐
│  🎯 Ultimate Shooting Tracker        🔔 👤      │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Sessions  │  │  Shots   │  │ Accuracy │       │
│  │    42     │  │  1,247   │  │   87%    │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐                      │
│  │ Best     │  │ Ranking  │                      │
│  │   98/100 │  │   #12    │                      │
│  └──────────┘  └──────────┘                      │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  Personal Bests                          │    │
│  │  ┌─────┬──────────┬───────┬─────────┐   │    │
│  │  │ 🥇 │ Overall   │ 98/100│ 5 Jul   │   │    │
│  │  │ 🥈 │ 10m       │ 95/100│ 3 Jul   │   │    │
│  │  │ 🥉 │ Glock 19  │ 94/100│ 1 Jul   │   │    │
│  │  └─────┴──────────┴───────┴─────────┘   │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  Accuracy Progress                       │    │
│  │  ┌────────────────────────────────────┐  │    │
│  │  │        ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁           │  │    │
│  │  └────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  Recent Sessions                         │    │
│  │  ┌──────────────────────────────────┐   │    │
│  │  │ 📍 Magnum · Glock 19 · 95/100   │   │    │
│  │  ├──────────────────────────────────┤   │    │
│  │  │ 📍 False Bay · CZ Shadow · 87/100│   │    │
│  │  ├──────────────────────────────────┤   │    │
│  │  │ 📍 Pretoria · Tikka · 92/100    │   │    │
│  │  └──────────────────────────────────┘   │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  FAB → [＋]                                      │
└──────────────────────────────────────────────────┘
```

---

## 3. Session Wizard (Multi-Step)

### Step Progress Indicator
```
    ● ── ○ ── ○ ── ○ ── ○ ── ○ ── ○ ── ○ ── ○ ── ○
  Range  Gun  Dist  Target Shots Before Shoot After ...
```
- Completed steps: filled circle with `--brand-primary`
- Current step: filled circle with pulse animation
- Future steps: outlined circle
- Horizontal scroll on mobile

### Step 3: Select Range
```
┌──────────────────────────────────────────┐
│  ← Back          Step 3 of 10            │
├──────────────────────────────────────────┤
│                                          │
│  Select Shooting Range                   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🔍 Search ranges...               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ○ Magnum United Shooting Range     │  │
│  │   Cape Town, South Africa          │  │
│  ├────────────────────────────────────┤  │
│  │ ○ False Bay Sport Shooting Club   │  │
│  │   Cape Town, South Africa          │  │
│  ├────────────────────────────────────┤  │
│  │ ○ Pretoria Shooting Club          │  │
│  │   Pretoria, South Africa           │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Don't see your range?                   │
│  Request admin to add it                 │
│                                          │
│           ┌──────────────────────┐       │
│           │     Next →           │       │
│           └──────────────────────┘       │
└──────────────────────────────────────────┘
```

### Step 8: Capture Before Image
```
┌──────────────────────────────────────────┐
│  ← Back          Step 8 of 10            │
├──────────────────────────────────────────┤
│                                          │
│  Capture Clean Target                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │      [Camera Viewport]            │  │
│  │                                    │  │
│  │    ┌── Alignment Guide ──┐         │  │
│  │    │  ┌──────────────┐  │         │  │
│  │    │  │   [Target]   │  │         │  │
│  │    │  └──────────────┘  │         │  │
│  │    └────────────────────┘         │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Position the target within the guide    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         📸 Capture Photo          │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Or upload from gallery: [Upload]        │
│                                          │
└──────────────────────────────────────────┘
```

### Step 10: Capture After Image
```
┌──────────────────────────────────────────┐
│  ← Back          Step 10 of 10           │
├──────────────────────────────────────────┤
│                                          │
│  Capture Completed Target                │
│                                          │
│  Before                    After          │
│  ┌──────────┐             ┌──────────┐   │
│  │          │             │          │   │
│  │ [Clean]  │     →       │ [Shot]   │   │
│  │          │             │          │   │
│  └──────────┘             └──────────┘   │
│                                          │
│  Side-by-side preview for comparison     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         📸 Capture Photo          │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │     Process & Score →             │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Step 11-12: Processing & Validation
```
┌──────────────────────────────────────────┐
│  Processing Target...                    │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │     🔄 Detecting target...        │  │
│  │     🔄 Correcting perspective...   │  │
│  │     🔄 Detecting bullet holes...   │  │
│  │     🔄 Calculating scores...       │  │
│  │     ✅ Complete!                   │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ▼ Validation                            │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  ⚠ Expected: 10 shots             │  │
│  │  ⚠ Detected:  9 shots             │  │
│  │  ┌────────────────────────────┐    │  │
│  │  │  Mismatch detected!        │    │  │
│  │  └────────────────────────────┘    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  What would you like to do?              │
│                                          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │  Reprocess   │  │ Replace Img  │     │
│  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────┐   │
│  │  Accept Detected Results         │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### Step 13: Review & Save
```
┌──────────────────────────────────────────┐
│  Review Session                          │
├──────────────────────────────────────────┤
│                                          │
│  Session Summary                         │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  📍 Range:  Magnum United          │  │
│  │  🔫 Firearm: Glock 19 (9mm)       │  │
│  │  📏 Distance: 10m                  │  │
│  │  🎯 Target:  NRA Bullseye          │  │
│  │  🔢 Shots:  10 expected / 9 detected│ │
│  │  📅 Date:  5 Jul 2026 14:30 SAST  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Results                                 │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Total Score:  87 / 100            │  │
│  │  Average:      9.7 per shot        │  │
│  │  Accuracy:     87%                 │  │
│  │  Group Size:   42mm                │  │
│  │  X-Rings:      2                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Shot Breakdown                          │
│  ┌──┬──────────┬───────┬────────────────┐│
│  │# │ Position │ Score │ Visual         ││
│  ├──┼──────────┼───────┼────────────────┤│
│  │1 │ (+12,+5) │  10   │ ● ← X-ring    ││
│  │2 │ (-8,+15) │   9   │ ●             ││
│  │3 │ (+3,-2)  │  10   │ ● ← X-ring    ││
│  │...│          │       │                ││
│  └──┴──────────┴───────┴────────────────┘│
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         [Annotated Target]         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        💾 Save Session             │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 4. User Firearms List

```
┌──────────────────────────────────────────┐
│  My Firearms                    [+ Add]  │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🔫 Glock 19                        │  │
│  │   9mm · Handgun · Red Dot         │  │
│  │   "Competition Gun"               │  │
│  │   124 sessions · 89% accuracy     │  │
│  │   ┌──────┐ ┌──────┐               │  │
│  │   │ Edit │ │ Stats│               │  │
│  │   └──────┘ └──────┘               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🔫 CZ Shadow 2                     │  │
│  │   9mm · Handgun · Iron Sights     │  │
│  │   "Carry Gun"                      │  │
│  │   38 sessions · 92% accuracy      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🔫 Tikka T3x                       │  │
│  │   .308 Win · Rifle · Scope        │  │
│  │   "Hunting Rifle"                  │  │
│  │   12 sessions · 94% accuracy      │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 5. Add Firearm Form

```
┌──────────────────────────────────────────┐
│  ← Back    Add Firearm                   │
├──────────────────────────────────────────┤
│                                          │
│  Manufacturer *                          │
│  ┌────────────────────────────────────┐  │
│  │  Select Manufacturer           ▼   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Model *                                 │
│  ┌────────────────────────────────────┐  │
│  │  Select Model                  ▼   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Firearm Type *                          │
│  ┌────────────────────────────────────┐  │
│  │  Handgun                       ▼   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Calibre *                               │
│  ┌────────────────────────────────────┐  │
│  │  9mm                            ▼   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Sight Type *                            │
│  ┌────────────────────────────────────┐  │
│  │  Red Dot                        ▼   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Barrel Length (inches)                  │
│  ┌────────────────────────────────────┐  │
│  │  4.49                               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Nickname                                │
│  ┌────────────────────────────────────┐  │
│  │  Competition Gun                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Notes                                   │
│  ┌────────────────────────────────────┐  │
│  │  Used for IDPA competitions        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        Save Firearm                │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 6. Leaderboard Page

```
┌──────────────────────────────────────────┐
│  Leaderboards               [Filter ▼]   │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────┬──────┬──────┬──────┬────────┐  │
│  │Global│10m   │25m   │Glock │ 9mm    │  │
│  └──────┴──────┴──────┴──────┴────────┘  │
│                                          │
│  ┌──┬──────────┬──────┬────────┬──────┐  │
│  │# │ Name     │Score │Accuracy│Shots │  │
│  ├──┼──────────┼──────┼────────┼──────┤  │
│  │🥇│ John D.  │ 98   │ 98%    │ 500  │  │
│  │🥈│ Sarah M. │ 95   │ 95%    │ 320  │  │
│  │🥉│ Mike R.  │ 92   │ 92%    │ 410  │  │
│  │4 │ Lisa K.  │ 90   │ 90%    │ 280  │  │
│  │5 │ Tom W.   │ 89   │ 89%    │ 350  │  │
│  │...│          │      │        │      │  │
│  │━━│━━━━━━━━━━│━━━━━━│━━━━━━━━│━━━━━━│  │
│  │📌│ You      │ 87   │ 87%    │ 240  │  │
│  │━━│━━━━━━━━━━│━━━━━━│━━━━━━━━│━━━━━━│  │
│  └──┴──────────┴──────┴────────┴──────┘  │
└──────────────────────────────────────────┘
```

---

## 7. Admin Dashboard

```
┌──────────────────────────────────────────────────┐
│  Admin Dashboard                     🛡️ Admin   │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Users    │ │ Sessions │ │ Ranges   │         │
│  │  1,247   │ │  5,832   │ │    28    │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐                       │
│  │ Firearms │ │ Comp.    │                       │
│  │  2,150   │ │    12    │                       │
│  └──────────┘ └──────────┘                       │
│                                                  │
│  Management Sections                             │
│  ┌──────────────────────────────────────────┐   │
│  │  📍 Shooting Ranges           Manage →   │   │
│  │  🔧 Manufacturers             Manage →   │   │
│  │  🔫 Firearm Models            Manage →   │   │
│  │  🎯 Target Types              Manage →   │   │
│  │  📏 Distances                 Manage →   │   │
│  │  👥 Users                     Manage →   │   │
│  │  🏆 Competitions              Manage →   │   │
│  │  🏅 Achievements              Manage →   │   │
│  │  📊 System Analytics          View →     │   │
│  │  ⚙ Application Settings      View →     │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Admin Data Table (CRUD)
```
┌──────────────────────────────────────────────────────┐
│  Shooting Ranges                        [+ Add New]  │
├──────────────────────────────────────────────────────┤
│  🔍 Search ranges...                                 │
├──┬──────────────┬─────────┬──────┬─────┬────────────┤
│  │ Name         │ Country │ City │ In/ │ Active     │
│  │              │         │      │Out  │            │
├──┼──────────────┼─────────┼──────┼─────┼────────────┤
│  │ Magnum United│ SA      │ CT   │ In  │ ✅ Edit 🗑│
│  │ False Bay    │ SA      │ CT   │ Out │ ✅ Edit 🗑│
│  │ Pretoria     │ SA      │ PTA  │ In  │ ✅ Edit 🗑│
│  │ ...          │         │      │     │            │
└──┴──────────────┴─────────┴──────┴─────┴────────────┘
```

---

# Dark Mode

Dark mode uses the dark tokens from the color palette above. Key patterns:

- **Backgrounds** shift to dark slate tones
- **Text** becomes light on dark
- **Cards** use subtly lighter backgrounds than the page
- **Shadows** become deeper but more transparent
- **Target previews** invert or use light theme within the image

### Toggle
- Respects `prefers-color-scheme` system setting
- Manual toggle in Settings and profile menu
- Persisted to local storage

---

# Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, bottom tabs |
| Tablet | 640px - 1024px | 2-column grid, sidebar collapsed |
| Desktop | > 1024px | Full sidebar, multi-column |

---

# Loading States

## Skeleton Loading

```
┌──────────────────────────┐
│ ████████ ████████        │  ← Pulsing gray bars
│ ████████████████         │
│ ┌────────────────────┐   │
│ │ ██████             │   │
│ │ ████████████       │   │
│ │ ██████             │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

## Upload Progress
```
┌──────────────────────────┐
│  Uploading target image  │
│  ████████████░░░░░░ 65%  │
│  Processing...            │
└──────────────────────────┘
```

## Error States
```
┌──────────────────────────┐
│  ⚠ Failed to load sessions│
│                          │
│  ┌────────────────────┐  │
│  │  Retry              │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

# Accessibility

- All touch targets minimum 44x44px
- Color contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large)
- All form inputs have associated labels
- Dropdowns support keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Images have alt text
- Focus indicators visible (2px outline with 2px offset)
- Screen reader announcements for loading, success, and error states
- Reduced motion media query for animations

---

# Animation Guidelines

| Animation | Duration | Easing | Usage |
|---|---|---|---|
| Page transitions | 300ms | ease-in-out | Route changes |
| Modal/bottom sheet | 250ms | ease-out | Slide up/down |
| Button press | 100ms | ease | Feedback |
| Card tap | 150ms | ease | Scale slight |
| Progress steps | 400ms | ease | Step transitions |
| Skeleton pulse | 1.5s | ease-in-out infinite | Loading |
| Camera capture | 200ms | ease | Flash effect |
| Score reveal | 500ms | ease-out | Number count-up |

---

# Icons

Using **Lucide React** icon library with consistent 24px default size.

Common icons:

| Context | Icon |
|---|---|
| Navigation | home, crosshair, target, trophy, bar-chart-3 |
| Range | map-pin, building-2 |
| Firearm | gun (custom or crosshair) |
| Calibre | circle-dot |
| Session | clipboard-list |
| Camera | camera, image-plus |
| Score | target, award |
| Accuracy | crosshair |
| Group size | circle, cross |
| Stats | trending-up, trending-down |
| Admin | shield, settings, users |
| Actions | plus, pencil, trash-2, more-horizontal |
| Status | check-circle, alert-circle, x-circle, clock |