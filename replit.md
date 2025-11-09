# Layercon MVP

## Overview
Layercon MVP is a React-based web application for managing and analyzing layer cases using the Darcy 3 phases method. The application provides a complete interface for creating, viewing, and analyzing cases with data visualization capabilities.

## Project Structure
- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Build Tool**: Vite
- **Development Port**: 5000

## Key Features
- Case management (create, view, list)
- Status tracking (idle, running, completed, error)
- Data visualization with charts
- Dark/Light theme support
- **Bilingual support (Spanish/English)** with language switcher
- Responsive sidebar navigation
- Search and filter capabilities

## File Structure
```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Card, Input, Table, etc.)
│   ├── Layout.tsx   # Main layout wrapper
│   ├── Navbar.tsx   # Top navigation with theme toggle
│   └── Sidebar.tsx  # Side navigation menu
├── pages/
│   ├── Home.tsx         # Landing page with quick access
│   ├── Cases.tsx        # Case list with search
│   ├── CaseDetail.tsx   # Individual case details
│   ├── CreateCase.tsx   # Form to create new cases
│   ├── Results.tsx      # Case results with charts
│   ├── Summary.tsx      # Analytics overview
│   ├── Data.tsx         # Data management
│   ├── Mapping.tsx      # Data mapping
│   └── Config.tsx       # Configuration
├── store/
│   └── useCases.ts  # Zustand store for case management
├── lib/
│   └── routes.ts    # Route definitions
├── mocks/
│   └── cases.json   # Mock case data
└── styles/
    └── globals.css  # Global styles
```

## Recent Changes (Nov 9, 2025)
- **Implemented complete bilingual support (Spanish/English)**:
  - Installed and configured i18next and react-i18next
  - Created comprehensive translation files for both languages
  - Added language switcher to Navbar with localStorage persistence
  - Updated all components to use translation hooks
  - Dynamic HTML lang attribute updates on language change
  - Default language: Spanish (with English available)
- Fixed incomplete JSX components that were truncated during GitHub import
- Completed Cases.tsx with table body rendering filtered cases
- Completed Results.tsx, CreateCase.tsx, Home.tsx, Navbar.tsx
- Fixed useCases store implementation (addCase, updateStatus, getById)
- Updated Table TD component to accept colSpan and other HTML attributes
- Configured Vite for Replit environment:
  - Set port to 5000 (required for webview)
  - Set host to 0.0.0.0 (required for network access)
  - Added `allowedHosts: true` (critical for Replit's proxy environment)
  - Configured HMR clientPort to 443
- Set up deployment configuration for autoscale

## Development
- **Start dev server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Deployment
The project is configured for Replit's autoscale deployment:
- Build command: `npm run build`
- Run command: `npx vite preview --host 0.0.0.0 --port 5000`

## Environment Setup
- Node.js 20
- All dependencies managed via npm
- Vite configured with HMR for Replit's proxy environment
