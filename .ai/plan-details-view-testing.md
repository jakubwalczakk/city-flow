# Plan Details View - Testing Guide

## Overview

This document provides testing instructions for the Plan Details view implementation. The view displays AI-generated travel plans with a structured timeline, warnings, and modifications.

## What Was Implemented

### 1. Type System Updates
- **Fixed type mismatch**: Updated `TimelineEvent` → `TimelineItem` to match database schema
- **Corrected structure**: Changed `days[].events` → `days[].items` to align with database validation
- **Added required fields**: 
  - `id` (string/UUID)
  - `type` ("activity" | "meal" | "transport")
  - `title` (string)
- **Added optional fields**: `time`, `description`, `location`, `estimated_price`, `estimated_duration`, `notes`
- **Added ViewModel fields**: `modifications` and `warnings` arrays

### 2. Component Updates

#### EventTimeline Component
- Updated to use `TimelineItem` instead of `TimelineEvent`
- Added type badges with icons (activity, meal, transport)
- Added location display with icon
- Added duration badges
- Added notes display with special styling
- Improved visual hierarchy and accessibility

#### GeneratedPlanView Component
- Updated to parse `days[].items` instead of `days[].events`
- Added validation for database schema compliance
- Added warnings banner (amber-themed card)
- Added modifications banner (blue-themed card)
- Added day summary statistics (item count, activity/meal breakdown)
- Improved accordion layout with better visual feedback

### 3. Page Creation
- Created `/src/pages/plans/[id].astro` for dynamic routing
- Integrated with existing `PlanDetailsView` component
- Added proper layout and container styling

## Database Schema Compliance

The implementation strictly follows the database validation schema defined in:
`supabase/migrations/20251024120250_add_generated_content_validation.sql`

### Required Structure
```json
{
  "days": [
    {
      "date": "2025-05-15",
      "items": [
        {
          "id": "uuid",
          "type": "activity|meal|transport",
          "title": "Title",
          // Optional fields:
          "time": "09:00",
          "description": "...",
          "location": "...",
          "estimated_price": "...",
          "estimated_duration": "...",
          "notes": "..."
        }
      ]
    }
  ],
  "modifications": ["..."],  // Optional
  "warnings": ["..."]         // Optional
}
```

## Testing Instructions

### Step 1: Start Development Environment

```bash
# Terminal 1: Start Supabase
cd /Users/jakubwalczak/Projects/city-flow
supabase start

# Terminal 2: Start Astro dev server
npm run dev
```

### Step 2: Insert Test Data

Run the test SQL script to create a sample generated plan:

```bash
supabase db execute --file supabase/test-generated-plan.sql
```

This will create a "Rome Weekend Getaway" plan with:
- 3 days of activities (May 15-17, 2025)
- 16 total items across all days
- Mix of activities, meals, and transport
- AI modifications and warnings
- All optional fields populated for comprehensive testing

### Step 3: Access the Plan

The script output will show the plan ID. Navigate to:
```
http://localhost:4321/plans/{plan_id}
```

Or find the plan in the plans list:
```
http://localhost:4321/plans
```

### Step 4: Test Scenarios

#### ✅ Visual Testing
- [ ] Plan loads without errors
- [ ] Warnings banner displays at the top (amber/yellow theme)
- [ ] Modifications banner displays below warnings (blue theme)
- [ ] Daily itinerary accordion displays all 3 days
- [ ] Each day shows correct date formatting
- [ ] Day summary shows item counts and breakdown
- [ ] Timeline displays all items with proper spacing
- [ ] Type badges show correct icons and labels
- [ ] Time badges display when available
- [ ] Location information displays with icon
- [ ] Estimated prices show in the right column
- [ ] Notes display with special styling
- [ ] Feedback module appears at the bottom

#### ✅ Interaction Testing
- [ ] Accordion expands/collapses smoothly
- [ ] Only one day can be open at a time
- [ ] Hover effects work on timeline items
- [ ] Back button navigates to plans list
- [ ] Edit name functionality works (from PlanHeader)
- [ ] Delete plan functionality works (from PlanHeader)

#### ✅ Responsive Testing
- [ ] Layout works on mobile (< 640px)
- [ ] Layout works on tablet (640px - 1024px)
- [ ] Layout works on desktop (> 1024px)
- [ ] Timeline is readable on all screen sizes
- [ ] Badges wrap properly on small screens

#### ✅ Edge Cases
- [ ] Plan with no warnings displays correctly
- [ ] Plan with no modifications displays correctly
- [ ] Items without time still display properly
- [ ] Items without location still display properly
- [ ] Items without estimated_price still display properly
- [ ] Items without notes still display properly
- [ ] Empty day (no items) shows appropriate message

#### ✅ Error Handling
- [ ] Invalid plan ID shows error message
- [ ] Non-existent plan shows "Plan not found"
- [ ] Invalid generated_content shows error with raw data
- [ ] Loading state displays spinner
- [ ] Network errors show appropriate message

### Step 5: Test with Different Data

Create additional test plans with variations:

#### Minimal Plan (Required Fields Only)
```sql
INSERT INTO plans (user_id, name, destination, start_date, end_date, status, generated_content)
VALUES (
  '17555d06-2387-4f0b-b4f8-0887177cadc1',
  'Minimal Test Plan',
  'Test City',
  '2025-06-01 00:00:00+00',
  '2025-06-02 00:00:00+00',
  'generated',
  '{
    "days": [
      {
        "date": "2025-06-01",
        "items": [
          {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "type": "activity",
            "title": "Test Activity"
          }
        ]
      }
    ]
  }'::jsonb
);
```

#### Plan with All Item Types
Test that each type (activity, meal, transport) displays with correct icon and styling.

#### Plan with Long Content
Test that long descriptions, titles, and notes wrap properly and don't break layout.

## Expected Behavior

### Type Icons
- **Activity**: Location pin icon
- **Meal**: Shopping cart icon
- **Transport**: Arrows icon

### Color Themes
- **Warnings**: Amber/yellow theme with warning triangle icon
- **Modifications**: Blue theme with info circle icon
- **Primary actions**: Default theme color
- **Timeline dots**: Primary color with border

### Typography
- **Day titles**: Semibold, larger text
- **Item titles**: Semibold, base size
- **Descriptions**: Regular, muted foreground color
- **Notes**: Smaller text with special border styling

## Known Limitations

1. **Date Formatting**: Currently uses US locale. May need internationalization.
2. **Time Format**: Expects 24-hour format (e.g., "09:00", "14:30").
3. **Currency**: No automatic currency conversion or formatting.
4. **Timezone**: Assumes all times are in the destination's local timezone.

## Troubleshooting

### "Plan not found" Error
- Verify the plan exists in the database
- Check that the plan belongs to the default user (17555d06-2387-4f0b-b4f8-0887177cadc1)
- Verify RLS policies are disabled for development

### "Invalid generated_content" Error
- Check that the JSON structure matches the database schema
- Verify all required fields are present (id, type, title)
- Ensure type is one of: "activity", "meal", "transport"
- Check browser console for detailed error messages

### Timeline Items Not Displaying
- Verify `items` array exists (not `events`)
- Check that each item has required fields
- Look for JavaScript errors in browser console

### Styling Issues
- Clear browser cache
- Verify Tailwind is compiling correctly
- Check that all Shadcn/ui components are installed
- Restart dev server

## Performance Considerations

- Large plans (10+ days, 50+ items) should still render smoothly
- Accordion lazy-loads content (only expanded day is fully rendered)
- Images are not currently supported in the schema
- Consider pagination for very large plans in future iterations

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation works for accordion
- Color contrast meets WCAG AA standards
- Screen readers can navigate the timeline structure
- Focus indicators are visible

## Next Steps

After successful testing:

1. ✅ Verify all test scenarios pass
2. ✅ Test with real AI-generated content (when available)
3. ✅ Gather user feedback on layout and usability
4. Consider adding:
   - Export functionality (PDF, iCal)
   - Print-friendly styles
   - Share functionality
   - Edit individual items
   - Reorder items within a day
   - Add custom items to generated plan

## Related Files

- `/src/types.ts` - Type definitions
- `/src/components/PlanDetailsView.tsx` - Main view component
- `/src/components/GeneratedPlanView.tsx` - Generated plan display
- `/src/components/EventTimeline.tsx` - Timeline component
- `/src/components/PlanHeader.tsx` - Header with edit/delete
- `/src/pages/plans/[id].astro` - Astro page
- `/src/hooks/usePlanDetails.ts` - Data fetching hook
- `supabase/migrations/20251024120250_add_generated_content_validation.sql` - Database validation
- `supabase/test-generated-plan.sql` - Test data script

