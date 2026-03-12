# Create Learning Form

## Overview

The Create Learning form is a focused, distraction-free capture surface for users to record new learnings in the learnimo app. It implements the "Library at Dusk" design system with professional, sharp styling suitable for engineers and knowledge workers.

## Features

### Form Fields

- **Title** (optional, max 200 characters)
  - Single-line text input
  - Live character counter
  - Optional helper text

- **Content** (required, 1-50,000 characters)
  - Auto-expanding textarea (minimum 180px height)
  - Live character counter
  - Placeholder text for guidance
  - Emphasized as the primary focus

### Validation

- Content is mandatory (error: "Content is required")
- Title limited to 200 characters (error: "Title must be 200 characters or less")
- Content limited to 50,000 characters (error: "Content must be between 1 and 50,000 characters")
- Submit button disabled until content has at least 1 character

### States

1. **Default (empty)**: Form ready for input, submit button visually muted/disabled
2. **Filling in**: Character counters update live, submit button becomes active
3. **Submitting**: Button shows "Saving..." text with loading state, fields disabled
4. **Validation error**: Inline error messages appear below relevant fields with red styling
5. **Success**: Navigates immediately to the new learning's detail view

### Interactions

- **Tab navigation**: Title → Content → Submit → Cancel
- **Keyboard shortcuts**:
  - Cmd/Ctrl+Enter: Submit the form from any field
  - Escape: Cancel and go back without saving
- **Character counters**: Turn red when at or over character limit
- **Error display**: Field borders turn red, error text appears below field with role="alert"
- **Auto-expand textarea**: Content field grows vertically as user types
- **Disabled state**: During submission, all fields and buttons are disabled to prevent double-submit

## Design System

### Colors (Dark Mode - Primary)

- Background: `#0F1B2D` (deep-navy)
- Form card: `#1A365D` (primary-blue)
- Text: `#F5F0E8` (parchment)
- Labels: `#8899AA` (muted text)
- Input border: `#2B4A78` (mid-blue)
- Focus border: `#D4854A` (ember-cta)
- Error text: `#E57373` (red)

### Colors (Light Mode)

- Background: `#F5F0E8` (parchment)
- Form card: `#FFFFFF` (white)
- Text: `#1A1A2E` (ink)
- Labels: `#666666` (muted text)
- Input border: `#CCC` (light gray)
- Focus border: `#D4854A` (ember-cta)
- Error text: `#C62828` (red)

### Typography

- Page heading: `Sora` 600, 32px
- Field labels: `DM Sans` 500, 14px
- Input text: `DM Sans` 400, 14px
- Character counter: `DM Sans` 400, 12px

## Component Structure

```
CreateLearningForm
├── LearningPageHeader
│   ├── Page title
│   └── Back navigation link
├── Form
│   ├── Title Field
│   │   ├── Label
│   │   ├── Input
│   │   ├── Error message
│   │   └── Character counter
│   ├── Content Field
│   │   ├── Label
│   │   ├── Textarea
│   │   ├── Error message
│   │   └── Character counter
│   └── Action buttons
│       ├── Cancel link
│       └── Save button
└── Toast (success notification)
```

## i18n Support

The form supports both English and Portuguese (Brazil) with the following key paths:

```
learnings.create.form.titleLabel
learnings.create.form.titlePlaceholder
learnings.create.form.contentLabel
learnings.create.form.contentPlaceholder
learnings.create.form.saveButton
learnings.create.form.savingButton
learnings.create.form.cancelButton
learnings.create.errors.contentRequired
learnings.create.errors.titleTooLong
learnings.create.errors.contentTooLong
learnings.create.success.message
```

## Accessibility

- All form fields have associated `<label>` elements
- Error messages use `role="alert"` for screen reader announcement
- Character counters connected to fields via `aria-describedby`
- Proper `aria-invalid` states on error
- Keyboard navigation: Tab order is Title → Content → Submit → Cancel
- Toast uses `role="status"` and `aria-live="polite"` for screen reader announcements
- Back button includes `aria-label` and screen reader-only text

## Usage

```tsx
import { CreateLearningForm } from '@/components/learnings/CreateLearningForm';
import { LearningPageHeader } from '@/components/learnings/LearningPageHeader';

export default function CreateLearningPage() {
  const handleSubmit = async (data) => {
    // Call API to create learning
    await learningApi.create(data);
    // Redirect or show success
  };

  return (
    <div>
      <LearningPageHeader locale="en" />
      <CreateLearningForm onSubmit={handleSubmit} locale="en" />
    </div>
  );
}
```

## Files

- `components/learnings/CreateLearningForm.tsx` - Main form component
- `components/learnings/LearningPageHeader.tsx` - Page header with navigation
- `lib/validations/learningSchema.ts` - Zod validation schema
- `app/[locale]/learnings/create/page.tsx` - Page route
- `locales/en.json` - English translations
- `locales/pt-BR.json` - Portuguese translations

## Validation Schema

Uses Zod for client-side validation:

```typescript
learningSchema = z.object({
  title: z
    .string()
    .max(200)
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000)
    .refine(val => val.trim().length > 0, {
      message: 'Content is required'
    })
})
```

## Browser Support

- Modern browsers with ES6+ support (client component — JavaScript required)
- Graceful degradation for auto-expanding textarea
