# UI/UX Design Brief
## Human Resource Management System (HRMS)

**Document Owner:** Senior UI/UX Designer  
**Status:** Approved  
**Last Updated:** July 4, 2026  
**Reference Docs:** [PRD (PRD.md)](./PRD.md) | [Design Spec (DESIGN.md)](./DESIGN.md) | [App Flow (FLOW.md)](./FLOW.md)

---

## 1. Design Style & Visual Direction

The HRMS design is based on the **"Cal.com Aesthetic"**—a clean, developer-friendly, high-contrast utility interface anchored on a stark white canvas. It is characterized by generous whitespace, fine borders, sharp geometric hierarchy, and product-as-art layout rules. 

### Core Styling Philosophy
1. **Canvas First**: Backgrounds remain pure white (`#ffffff`). Accent sections and cards use light grays (`#f5f5f5`). Dark surfaces are reserved for the Admin featured card and global footer.
2. **Confident Monochrome**: Text and key CTA elements are solid near-black (`#111111`). Accent colors are used exclusively for semantic badges (status states) and initials inside avatars.
3. **No Decorative Bloat**: The visual appeal comes from clean typography, tight alignments, and functional interactive components (like scheduling tables or calendar widgets) rather than decorative illustrations or heavy gradient drop shadows.

---

## 2. Color Palette (OKLCH & HEX Spec)

Implement styles using custom CSS variables mapped in OKLCH (per the codebase's existing `index.css` configuration) or standard HEX formats:

| Color Token | OKLCH Mapping | HEX Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| **`canvas`** | `oklch(1 0 0)` | `#ffffff` | Primary screen background, input fill. |
| **`primary / ink`** | `oklch(0.205 0 0)` | `#111111` | Primary text, primary CTA button, active links. |
| **`primary-active`** | `oklch(0.145 0 0)` | `#242424` | Hover / Active pressed state for buttons. |
| **`surface-soft`** | `oklch(0.985 0 0)` | `#f8f9fa` | Sidebar navigation background, pill selector fill. |
| **`surface-card`** | `oklch(0.97 0 0)` | `#f5f5f5` | Non-active cards, list items, section separators. |
| **`surface-dark`** | `oklch(0.145 0 0)` | `#101010` | Global page footer background, featured admin cards. |
| **`hairline`** | `oklch(0.922 0 0)` | `#e5e7eb` | Standard 1px card outlines, divider lines, form borders. |
| **`muted`** | `oklch(0.556 0 0)` | `#6b7280` | Secondary copy, descriptors, field labels. |
| **`muted-soft`** | `oklch(0.708 0 0)` | `#898989` | Footer links, timestamp indicators, table headers. |

### Semantic Badges (Status Markers)
- **Success / Present / Approved**: Emerald Green (`#10b981` / `oklch(0.627 0.194 149.22)`)
- **Warning / Pending / Half-day**: Warm Amber (`#f59e0b` / `oklch(0.769 0.188 70.08)`)
- **Error / Absent / Rejected**: Crimson Red (`#ef4444` / `oklch(0.627 0.265 27.33)`)
- **Leave / Shift Hold**: Sky Blue (`#3b82f6` / `oklch(0.623 0.214 259.02)`)

---

## 3. Typography & Text Hierarchy

We run two distinct font faces: **Cal Sans** (display) and **Inter** (body and interface). Since Cal Sans is commercial, we use **Inter Variable** at weight `600` with tight letter tracking as a replacement for display headlines.

### Typography Specifications Table

| Size Token | Font Family | Size (px) | Weight | Line Height | Tracking (Letter Spacing) | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`display-xl`** | Inter Variable | 64px | 600 | 1.05 | `-0.04em` | Main hero headings |
| **`display-lg`** | Inter Variable | 48px | 600 | 1.10 | `-0.03em` | Main section headings |
| **`display-md`** | Inter Variable | 36px | 600 | 1.15 | `-0.02em` | Major category headlines |
| **`display-sm`** | Inter Variable | 28px | 600 | 1.20 | `-0.01em` | Card groups, billing rates |
| **`title-lg`** | Inter | 22px | 600 | 1.30 | `0` | Drawer and Modal headers |
| **`title-md`** | Inter | 18px | 600 | 1.40 | `0` | Feature headers, profile sections |
| **`title-sm`** | Inter | 16px | 600 | 1.40 | `0` | Card labels, list headers |
| **`body-md`** | Inter | 16px | 400 | 1.50 | `0` | Standard paragraphs, inputs |
| **`body-sm`** | Inter | 14px | 400 | 1.50 | `0` | Details, secondary lists, footers |
| **`caption`** | Inter | 13px | 500 | 1.40 | `0` | Tag labels, badge symbols |

---

## 4. Layout & Spacing Rhythm

A modular baseline grid of **4px** regulates all layout rules.

### Spacing Tokens
- `spacing.xxs` = 4px
- `spacing.xs` = 8px
- `spacing.sm` = 12px
- `spacing.md` = 16px
- `spacing.lg` = 24px
- `spacing.xl` = 32px
- `spacing.xxl` = 48px
- `spacing.section` = 96px (standard vertical padding between main grid segments)

### Page Geometry
- **Max Width**: `1200px` centered container limit on all web screens.
- **Side Margins**: `16px` on mobile, `32px` on tablet, and `auto` on desktop.
- **Grids**: Standard 12-column flexbox grid layouts. 
  - Feature cards: 3-up on desktop, 2-up on tablet, 1-up on mobile.
  - Form grids: 2-column on desktop, collapsing to single-column on mobile screens.

---

## 5. Component Style Guide

Every component must use a strict border-radius hierarchy:

```
[rounded.sm: 6px] -----> dropdown items, inline triggers
[rounded.md: 8px] -----> buttons, text inputs, category tabs
[rounded.lg: 12px] ----> content cards (profile blocks, features, logs)
[rounded.xl: 16px] ----> marquee cards, calendar containers, hero frames
[rounded.pill: 9999px] -> nav-pill wrappers, status badges
[rounded.full: 50%] ----> avatar picture masks, action circular icons
```

### 5.1 Input Elements
- **Text Input**: `h-[40px] px-3.5 border border-hairline bg-canvas text-ink text-body-md rounded-md focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none transition-all`
- **Text Area**: `px-3.5 py-2 border border-hairline bg-canvas text-ink text-body-md rounded-md focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none transition-all resize-none min-h-[100px]`

### 5.2 Interactive Controls
- **Nav Pill Group**: Rounded-pill container (`rounded-pill bg-surface-soft p-1.5 flex gap-1`). Active tab within is a white card (`bg-canvas text-ink shadow-sm rounded-md px-3.5 py-2 text-nav-link`); inactive tabs are transparent (`text-muted`).

### 5.3 Buttons
- **Primary CTA**: `h-[40px] bg-primary text-canvas font-semibold px-5 rounded-md hover:bg-primary-active active:scale-[0.98] transition-all`
- **Secondary Action**: `h-[40px] border border-hairline bg-canvas text-ink px-5 rounded-md hover:bg-surface-card active:scale-[0.98] transition-all`
- **Destructive CTA**: `h-[40px] bg-error text-canvas font-semibold px-5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all`

---

## 6. App Dashboard Layout Structure

### 6.1 Employee Dashboard (`EMP-DASH-01`)
A responsive layout focusing on immediate utility actions:

```
+-------------------------------------------------------------+
| [Logo] HRMS                [Title: Home]     (Avatar) Logout |
+-------------------------------------------------------------+
|                                                             |
|  Good morning, Jane!                                        |
|  Today is Saturday, July 4, 2026                            |
|                                                             |
|  +---------------------+  +------------------------------+  |
|  | Profile Card        |  | Attendance Status Card       |  |
|  | -> Designation      |  | -> Checked in: 09:02 AM      |  |
|  | [View Details]      |  | [Check Out] button (Active)  |  |
|  +---------------------+  +------------------------------+  |
|  | Leave Tracker Card  |  | Salary Summary Card          |  |
|  | -> 1 Pending        |  | -> Base: $4,500/mo           |  |
|  | [+ Apply for Leave] |  | [View Structure]             |  |
|  +---------------------+  +------------------------------+  |
|                                                             |
|  Recent Activity & Alerts                                   |
|  +-------------------------------------------------------+  |
|  | - You checked out yesterday at 05:12 PM               |  |
|  | - Your Sick Leave application for Jul 10 is Approved  |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
```

### 6.2 Admin / HR Dashboard (`ADM-DASH-01`)
High-density grid layout for system configuration and queue resolution:

```
+-------------------------------------------------------------------------+
| [Logo] HRMS                  Admin Portal               (Avatar) Logout |
+-------------------------------------------------------------------------+
| [Search Directory] [Department: All v]                   [+ Add Employee]
|                                                                         |
|  Metric Cards:                                                          |
|  +-----------------+  +-----------------+  +-------------------------+  |
|  | Total Employees |  | Present Today   |  | Pending Leave Approvals |  |
|  | 42 Active       |  | 38 Checked-in   |  | 3 Requests (Urgent)     |  |
|  +-----------------+  +-----------------+  +-------------------------+  |
|                                                                         |
|  Leave Approvals Queue (Top 3)                                          |
|  +-------------------------------------------------------------------+  |
|  | John Doe | Sick Leave | Jul 10 - Jul 12 (3 Days)  [Approve] [Reject]|  |
|  | Mary Key | Paid Leave | Jul 15 - Jul 20 (5 Days)  [Approve] [Reject]|  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  Employee Listing                                                       |
|  +-------------------------------------------------------------------+  |
|  | Name      | Employee ID | Department | Designation  | Status      |  |
|  |-----------|-------------|------------|--------------|-------------|  |
|  | John Doe  | EMP202644   | Engineer   | Front-End    | Present     |  |
|  | Mary Key  | EMP202652   | Design     | Product Designer | Present |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 7. Responsive Behavior Rules

### 7.1 Breakpoints
1. **Mobile** (`< 768px`):
   - Shell wraps into top bar with collapsible drawer menu trigger.
   - Core grids stack to a `1-column` block.
   - Profile cards shift to fit small-screen details, hiding optional fields.
   - Floating Action Button (FAB) toggles Check-In / Check-Out triggers.
2. **Tablet** (`768px - 1024px`):
   - Sidebar changes to icon-only vertical configuration.
   - Grids split to `2-column` layouts.
3. **Desktop** (`> 1024px`):
   - Left-sidebar displays full-text label links.
   - Directory structures display standard 12-column spacing lists.

### 7.2 Component Transformations
- **Tables**: Collapses table columns on mobile, transitioning each row into an independent summary card containing a detail disclosure toggle.
- **Modals**: Full-screen modal sheets load from the screen bottom on mobile; desktop renders fixed overlays centered with backdrop filters.

---

## 8. User Experience Principles

1. **Skeleton Load States**: Do not use loading spinners or blank screens. Use gray, pulse-animating skeleton elements that mirror the text rows or dashboard card structures.
2. **Inline Input Help**: Validation failures must be caught live (`onBlur`) and display inline field errors in red (`text-error text-caption`), disabling the submit trigger until fixed.
3. **Zero Destructive Accidents**: Modals are mandatory for state-changing actions. The "Confirm" prompt button in destructive states (such as deactivating an employee or rejecting a leave request) must use a crimson red configuration.
4. **Optimistic UI Updates**: Buttons update state immediately (e.g. check-in timestamp logging) and revert only if network pipelines fail, ensuring instantaneous UI feedback.

---

## 9. Visual References & Spec Assets

1. **Calendar Picker Frame**: Mimics the Cal.com booking view. Border outline 1px gray (`#e5e7eb`), white card cells (`bg-canvas text-ink hover:bg-surface-card`), with rounded selection highlights (`rounded-lg`).
2. **Activity Timeline**: Minimal vertical hairline line (`border-l border-hairline`) decorated with solid dots color-coded by check-in / request event type.
3. **Initials-Based Avatars**: Colorful circles featuring a pastel fill (`#fb923c`, `#ec4899`, `#8b5cf6`, or `#34d399`) and contrast text, representing employees when photos are unavailable.
