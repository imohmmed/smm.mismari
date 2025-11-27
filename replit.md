# SMM Panel - Social Media Marketing Services Platform

## Overview

This is a full-stack Social Media Marketing (SMM) panel application that allows users to purchase social media engagement services (followers, likes, views, etc.) across multiple platforms. The application features a mobile-first design with Arabic/English bilingual support and RTL layout capabilities, inspired by Telegram's clean aesthetic.

The platform integrates with the Amazing SMM API to provide real-time service offerings and order management, with a 15% profit margin applied to all services. Users can browse services by platform, place orders, manage their balance, and track order status through an intuitive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- TailwindCSS for utility-first styling with custom design system

**UI Component Library:**
- Shadcn/ui components built on Radix UI primitives
- Custom component library following mobile-first design principles
- RTL/LTR support with dynamic direction switching
- Dark/light theme support via context API

**State Management:**
- React Query (TanStack Query) for server state management and API caching
- React Context API for global state (language, theme)
- Local component state for UI interactions

**Design System:**
- Mobile-first responsive design (320px-7xl breakpoints)
- Telegram-inspired color palette with HSL-based theming
- IBM Plex Sans Arabic font for Arabic text
- Inter font for English text
- Consistent spacing scale (4, 6, 8, 12, 16)

**Routing & Navigation:**
- Client-side navigation via state management (no router library)
- Bottom navigation bar as primary navigation pattern
- Five main pages: New Order, Orders, Add Funds, Account, Support

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and middleware
- Node.js runtime with ES modules
- Session-based architecture (prepared for authentication)

**API Integration:**
- Amazing SMM API client for fetching services and creating orders
- 15% profit margin applied to all service pricing
- Service caching mechanism to reduce API calls
- Platform detection from service names/categories

**Data Layer:**
- In-memory storage implementation (MemStorage class)
- Prepared for PostgreSQL migration via Drizzle ORM
- Schema definitions using Drizzle and Zod for validation

**Build & Deployment:**
- esbuild for server bundling with selective dependency bundling
- Vite for client-side bundling
- Production build outputs to `dist/` directory

### Database Schema

**Users Table:**
- ID (UUID primary key)
- Username (unique)
- Password (hashed)
- Email, phone (optional)
- Balance (real/float, default 0)
- Total spent tracking
- Discount percentage

**Orders Table:**
- Auto-incrementing order ID
- User ID (foreign key)
- Service ID, name, link
- Quantity, charge (cost)
- Status (Pending, In Progress, Completed, Partial, Canceled, Refunded)
- Start count and remaining count for progress tracking
- Timestamps

**Service Schema:**
- Service ID, name, type
- Rate (base price), min/max quantities
- Category and platform
- Refill, cancel, dripfeed capabilities
- Rate with markup (calculated at 15%)

### External Dependencies

**Third-Party APIs:**
- Amazing SMM API (https://amazingsmm.com/api/v2)
  - Provides social media service catalog
  - Handles order placement and status updates
  - Requires API key configuration via environment variable

**Database:**
- Neon Database (PostgreSQL) via @neondatabase/serverless
- Connection via DATABASE_URL environment variable
- Drizzle ORM for type-safe database operations

**UI & Styling:**
- Google Fonts API for IBM Plex Sans Arabic and Inter fonts
- Radix UI primitives for accessible component foundation
- React Icons (Simple Icons) for platform logos

**Payment Processing:**
- Prepared for multiple payment methods:
  - Credit cards (Mastercard/Visa via Stripe - not yet implemented)
  - ZainCash mobile wallet (Iraq)
  - AsiaCash mobile wallet (Iraq)

**Development Tools:**
- Replit-specific plugins for development banner and error overlay
- TypeScript for type checking
- ESBuild for fast bundling

**Key Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `AMAZING_SMM_API_KEY` - API key for Amazing SMM service
- `NODE_ENV` - Environment mode (development/production)

**Session Management:**
- Express-session with connect-pg-simple for PostgreSQL session store
- Memory store fallback for development