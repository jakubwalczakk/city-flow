# Plan Details View - Visual Guide

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Plans                                            │
├─────────────────────────────────────────────────────────────┤
│  PLAN HEADER                                                │
│  Rome Weekend Getaway                           [Edit] [⋮]  │
│  May 15 - May 17, 2025                                      │
├─────────────────────────────────────────────────────────────┤
│  ⚠️ IMPORTANT REMINDERS                                     │
│  • This plan is an AI-generated suggestion...               │
│  • Book Vatican Museums and Colosseum tickets...            │
│  • Many churches require modest dress...                    │
├─────────────────────────────────────────────────────────────┤
│  ℹ️ PLAN ADJUSTMENTS                                        │
│  • Adjusted Vatican visit to early morning...               │
│  • Added gelato break between Piazza Navona...              │
│  • Moved Trastevere to final day...                         │
├─────────────────────────────────────────────────────────────┤
│  DAILY ITINERARY                                            │
│  Expand each day to see your personalized schedule          │
│                                                              │
│  ▼ [1] Thursday, May 15, 2025                               │
│      7 items • 4 activities • 2 meals                       │
│      ┌───────────────────────────────────────────────────┐ │
│      │ ○ [09:00] [📍 Activity] [2 hours]                 │ │
│      │   Colosseum Tour                          16 EUR   │ │
│      │   📍 Piazza del Colosseo, 1...                    │ │
│      │   Explore the iconic ancient amphitheater...      │ │
│      │   💡 Note: Book tickets online to skip queue      │ │
│      ├───────────────────────────────────────────────────┤ │
│      │ ○ [11:30] [📍 Activity] [2 hours]                │ │
│      │   Roman Forum & Palatine Hill    Included         │ │
│      │   📍 Via della Salara Vecchia...                  │ │
│      │   Walk through ancient ruins...                   │ │
│      └───────────────────────────────────────────────────┘ │
│                                                              │
│  ▶ [2] Friday, May 16, 2025                                 │
│      8 items • 5 activities • 2 meals                       │
│                                                              │
│  ▶ [3] Saturday, May 17, 2025                               │
│      6 items • 3 activities • 2 meals                       │
├─────────────────────────────────────────────────────────────┤
│  FEEDBACK                                                    │
│  How was this plan? [👍] [👎]                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Warnings Banner (Amber Theme)

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️  IMPORTANT REMINDERS                                     │
│     Please review these notes before your trip              │
│                                                              │
│  • This plan is an AI-generated suggestion. Please verify   │
│    opening hours, prices, and availability before your trip.│
│  • Book Vatican Museums and Colosseum tickets online in     │
│    advance to skip long queues.                             │
│  • Many churches and religious sites require modest dress   │
│    (covered shoulders and knees).                           │
└─────────────────────────────────────────────────────────────┘
```

**Colors**:
- Background: `bg-amber-50` (light) / `bg-amber-950/20` (dark)
- Border: `border-amber-200` (light) / `border-amber-900` (dark)
- Icon: `text-amber-600` (light) / `text-amber-500` (dark)
- Title: `text-amber-900` (light) / `text-amber-100` (dark)
- Text: `text-amber-800` (light) / `text-amber-200` (dark)

### 2. Modifications Banner (Blue Theme)

```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️  PLAN ADJUSTMENTS                                        │
│     Changes made to optimize your itinerary                 │
│                                                              │
│  • Adjusted Vatican visit to early morning to avoid crowds  │
│  • Added gelato break between Piazza Navona and dinner for  │
│    authentic experience                                     │
│  • Moved Trastevere to final day for a relaxed ending to    │
│    the trip                                                 │
└─────────────────────────────────────────────────────────────┘
```

**Colors**:
- Background: `bg-blue-50` (light) / `bg-blue-950/20` (dark)
- Border: `border-blue-200` (light) / `border-blue-900` (dark)
- Icon: `text-blue-600` (light) / `text-blue-500` (dark)
- Title: `text-blue-900` (light) / `text-blue-100` (dark)
- Text: `text-blue-800` (light) / `text-blue-200` (dark)

### 3. Day Accordion (Collapsed)

```
┌─────────────────────────────────────────────────────────────┐
│ ▶ [2] Friday, May 16, 2025                            ▼    │
│      [8 items] 5 activities • 2 meals                       │
└─────────────────────────────────────────────────────────────┘
```

**Elements**:
- Day number badge: Circular, `bg-primary/10`, `text-primary`
- Date: Semibold, formatted as "Weekday, Month Day, Year"
- Statistics: Badge + muted text
- Chevron: Indicates expand/collapse state

### 4. Day Accordion (Expanded)

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ [2] Friday, May 16, 2025                            ▲    │
│      [8 items] 5 activities • 2 meals                       │
│   ┌─────────────────────────────────────────────────────┐  │
│   │ Timeline with vertical line and items               │  │
│   └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5. Timeline Item (Activity)

```
┌───────────────────────────────────────────────────────────┐
│ ○ [09:00] [📍 Activity] [2 hours]                        │
│   Colosseum Tour                               16 EUR    │
│   📍 Piazza del Colosseo, 1, 00184 Roma RM, Italy        │
│   Explore the iconic ancient amphitheater with a guided  │
│   tour. Learn about gladiatorial combat and Roman        │
│   history.                                               │
│   💡 Note: Book tickets online to skip the queue. Arrive │
│   15 minutes early.                                      │
└───────────────────────────────────────────────────────────┘
```

**Elements**:
- Timeline dot: Small circle with primary border
- Time badge: `bg-primary/10`, `text-primary`, clock icon
- Type badge: Outlined, with type-specific icon
- Duration badge: Secondary variant
- Title: Semibold, larger text
- Location: With map pin icon, muted text
- Description: Regular text, muted foreground
- Notes: Special box with left border accent
- Price: Right-aligned, in muted background box

### 6. Timeline Item (Meal)

```
┌───────────────────────────────────────────────────────────┐
│ ○ [13:30] [🛒 Meal] [1.5 hours]                          │
│   Lunch at Trattoria Luzzi              25-35 EUR/person │
│   📍 Via di S. Giovanni in Laterano, 88...               │
│   Traditional Roman trattoria near the Colosseum. Try    │
│   the carbonara or cacio e pepe.                         │
└───────────────────────────────────────────────────────────┘
```

**Icon**: Shopping cart (🛒)

### 7. Timeline Item (Transport)

```
┌───────────────────────────────────────────────────────────┐
│ ○ [15:30] [↔️ Transport] [20 minutes]                     │
│   Metro to Trevi Fountain                        1.50 EUR │
│   📍 Metro Colosseo to Metro Barberini                    │
│   Take Metro Line B from Colosseo to Barberini station,  │
│   then walk 5 minutes.                                   │
└───────────────────────────────────────────────────────────┘
```

**Icon**: Arrows (↔️)

## Type Icons

### Activity (📍)
```svg
<svg> <!-- Location pin icon -->
  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
</svg>
```

### Meal (🛒)
```svg
<svg> <!-- Shopping cart icon -->
  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
</svg>
```

### Transport (↔️)
```svg
<svg> <!-- Arrows icon -->
  <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
</svg>
```

## Responsive Behavior

### Desktop (> 1024px)
- Full width container (max-w-5xl)
- Side-by-side layout for badges
- Price aligned to the right
- Comfortable spacing

### Tablet (640px - 1024px)
- Slightly narrower container
- Badges may wrap to multiple lines
- Price still visible on the right
- Reduced spacing

### Mobile (< 640px)
- Full width with padding
- Badges stack vertically
- Price moves below description
- Compact spacing
- Timeline line thinner

## Color Palette

### Primary Colors
- Primary: Theme-defined (typically blue/purple)
- Primary/10: Very light primary for backgrounds
- Primary/50: Light primary for hover states

### Semantic Colors
- **Success**: Green (not used in current implementation)
- **Warning**: Amber/Yellow (for warnings banner)
- **Info**: Blue (for modifications banner)
- **Error**: Red (for error states)

### Neutral Colors
- **Foreground**: Main text color
- **Muted Foreground**: Secondary text (60% opacity)
- **Border**: Subtle borders
- **Card**: Card background
- **Background**: Page background

## Spacing System

- **Container**: `max-w-5xl mx-auto px-4 py-8`
- **Section gaps**: `space-y-6` (1.5rem)
- **Card padding**: `p-4` or `p-6`
- **Timeline items**: `space-y-6`
- **Badge gaps**: `gap-2`
- **Icon-text gaps**: `gap-1.5` or `gap-2`

## Typography Scale

- **Page title**: `text-2xl font-semibold`
- **Card title**: `text-lg font-semibold`
- **Day title**: `text-base font-semibold`
- **Item title**: `text-base font-semibold`
- **Body text**: `text-sm`
- **Small text**: `text-xs`
- **Badges**: `text-xs font-medium`

## Animation & Transitions

- **Accordion**: Smooth expand/collapse with Radix UI
- **Hover effects**: `hover:shadow-md transition-shadow`
- **Button hovers**: `hover:bg-primary/90`
- **Link hovers**: `hover:text-foreground transition-colors`

## Accessibility Features

- **Focus indicators**: Visible outline on keyboard focus
- **ARIA labels**: On all interactive elements
- **Semantic HTML**: Proper heading hierarchy
- **Color contrast**: WCAG AA compliant
- **Keyboard navigation**: Full support for accordion
- **Screen reader**: Proper labeling and structure

## Dark Mode Support

All components support dark mode through Tailwind's `dark:` variants:
- Backgrounds adjust automatically
- Text colors invert appropriately
- Borders remain subtle
- Icons maintain visibility
- Accent colors (amber, blue) have dark variants

## Print Styles (Future Enhancement)

Suggested print styles:
- Expand all accordions
- Remove interactive elements
- Optimize for A4/Letter paper
- Black and white friendly
- Page breaks between days

