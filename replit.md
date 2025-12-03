# Onyx Energy Solutions - Solar Installation Website

## Overview

This is a full-stack React application built for Onyx Energy Solutions, a solar installation company. The application features a modern, responsive website with an integrated contact form system and AR solar panel preview functionality. The project uses a modern tech stack with React frontend, Express backend, PostgreSQL database, and is designed for deployment on Replit.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with custom Onyx Energy brand colors
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Email Service**: SendGrid integration for contact form notifications

### Database Design
- **Database**: PostgreSQL (configured for Neon serverless)
- **Tables**: 
  - `users` - Basic user management
  - `contact_inquiries` - Solar quote requests and contact forms
- **Schema**: Defined in `shared/schema.ts` with Drizzle ORM and Zod validation

## Key Components

### Contact Management System
- Lead capture through contact forms
- Automatic email notifications via SendGrid
- Solar savings calculator
- Quote type selection (residential/commercial)
- Full contact inquiry tracking and storage

### Solar Roof Designer
- Interactive satellite imagery-based solar panel design tool
- Google Maps integration with address search functionality
- Roof tracing tool to outline roof areas with polygon drawing
- Automatic square footage calculation
- Solar panel placement system with visual management
- Real-time calculations for system size (kW), annual production (kWh), and savings estimates
- 20-year savings projections based on Massachusetts electricity rates
- Direct integration with quote system
- Mobile and desktop responsive design

### Media Gallery
- Image and video gallery showcasing installations
- Support for multiple video formats (MP4)
- HEIC to JPEG automatic conversion for images
- Local file serving with proper content type headers
- Organized by installation type and date

### Extras Services Page
- Showcase of additional services (batteries, roofing, mini-splits, EV chargers, energy monitoring, warranties)
- Gradient background cards with hover effects
- Service descriptions and benefits

### AR Solar Preview (Experimental)
- Camera-based AR functionality for solar panel visualization
- Interactive panel placement and manipulation
- Real-time savings calculations based on panel count
- Mobile-optimized touch controls

### Brand Customization
- Custom color picker for brand theming
- Dynamic CSS variable updates
- Onyx Energy Solutions branded components and assets

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Custom breakpoints and responsive utilities
- Optimized for solar industry user experience

## Data Flow

1. **Frontend Request**: User interactions trigger React components
2. **API Layer**: TanStack Query manages HTTP requests to Express backend
3. **Backend Processing**: Express routes handle business logic and validation
4. **Database Operations**: Drizzle ORM executes type-safe database queries
5. **External Services**: SendGrid handles email notifications
6. **Response**: Data flows back through the same chain to update UI

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **@sendgrid/mail**: Email service integration
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Database ORM and query builder
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **drizzle-kit**: Database migrations and schema management
- **@replit/vite-plugin-***: Replit-specific development plugins

### AR/3D Features
- **@ar-js-org/ar.js**: Augmented reality functionality
- **@types/three**: 3D graphics type definitions

## Deployment Strategy

### Development Environment
- **Platform**: Replit with integrated development tools
- **Hot Reload**: Vite dev server with HMR
- **Database**: Neon serverless PostgreSQL
- **Environment Variables**: DATABASE_URL, SENDGRID_API_KEY, google (Google Maps API key)

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations via `npm run db:push`
- **Deployment**: Node.js production server serving static files and API

### Configuration Files
- **Vite**: Custom configuration with path aliases and Replit plugins
- **TypeScript**: Monorepo setup with shared types between client/server
- **Tailwind**: Extended theme with custom Onyx Energy brand colors
- **Drizzle**: PostgreSQL dialect with schema-first migrations

## Changelog
- October 18, 2025: Added Solar Roof Designer with Google Maps integration, roof tracing, panel placement, and real-time savings calculations
- October 16, 2025: Added Extras page with service cards and expanded gallery to 2 images and 11 videos
- October 13, 2025: Updated mission statement and homepage installation count
- July 01, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.