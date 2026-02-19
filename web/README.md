# learnimo - Web

> Next.js web application for learnimo

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript 5**
- **Tailwind CSS 3**
- **next-intl** for i18n (EN/PT-BR)
- **next-themes** for dark mode

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Access the App

- http://localhost:3000 (redirects to /en)
- http://localhost:3000/en (English)
- http://localhost:3000/pt-BR (Portuguese)

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npm run typecheck
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Root redirect
│   ├── globals.css       # Global styles
│   ├── not-found.tsx     # 404 page
│   └── [locale]/
│       ├── layout.tsx    # Locale layout with header
│       └── page.tsx      # Home page
├── components/
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── ThemeToggle.tsx
│       └── LanguageToggle.tsx
├── hooks/
│   └── useTheme.ts
├── lib/
│   ├── i18n.ts           # i18n configuration
│   └── utils.ts          # Utility functions
├── locales/
│   ├── en.json           # English translations
│   └── pt-BR.json        # Portuguese translations
└── middleware.ts         # i18n middleware
```

## Features

- Dark mode (default) with light mode toggle
- i18n support (English and Portuguese)
- Responsive design
- TypeScript strict mode
- Tailwind CSS for styling

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost:8080/api/v1) |
