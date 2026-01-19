# Moodly Clone - Technical Specification

## Project Overview
An open-source mood and habit tracking web application built as a Moodly clone, designed for personal use with offline-first capabilities and cloud sync.

## Architecture Pattern
**Monorepo** - Single repository containing all project components with shared code and types.

## Repository Structure

### Root Level
- Monorepo manager: **pnpm workspaces**
- Version control: **Git** with GitHub
- Deployment: Automated via **GitHub Actions** on every push to main branch

### Workspace Organization
Three main workspaces:
1. **apps/web** - SvelteKit frontend application
2. **apps/api** - Hono backend API
3. **packages/shared** - Shared TypeScript types, schemas, and utilities

## Frontend Stack

### Framework & Runtime
- **SvelteKit** - Full-stack web framework
- **Adapter**: @sveltejs/adapter-cloudflare
- **Hosting**: Cloudflare Pages with automatic GitHub deployments
- **SSR**: Pages Functions for server-side rendering when needed

### State Management
- **SvelteKit stores** for global application state
- **Dexie.js** for local IndexedDB operations
- Component-level state with Svelte's reactive declarations

### Styling
- **TailwindCSS** for utility-first styling
- Mobile-first responsive design approach
- Dark mode support via Tailwind

### Local Storage
- **Dexie.js** - IndexedDB wrapper for structured local data storage
- Stores all user data locally for offline-first experience
- Acts as primary data source with background sync to cloud

## Backend Stack

### Framework & Runtime
- **Hono** - Lightweight web framework for Cloudflare Workers
- **Hosting**: Cloudflare Workers (edge functions)
- **TypeScript** throughout

### Database
- **Neon** - Serverless PostgreSQL database
- Connection via HTTP for Workers compatibility
- **Drizzle ORM** for type-safe database queries and migrations

### Database Schema Management
- Drizzle Kit for schema migrations
- Schema definitions live in packages/shared for type sharing
- Migration files stored in apps/api

## Authentication

### Provider
- **Auth.js** (formerly NextAuth.js)
- Adapter: SvelteKit integration
- **OAuth Provider**: Google OAuth 2.0 only (primary authentication method)

### Session Management
- JWT-based sessions
- Tokens stored in HTTP-only cookies
- Session state synchronized between client and server

### User Flow
- Users authenticate via Google OAuth
- User ID links to their mood entries and customizations in database
- Local Dexie data associates with user ID for sync purposes

## Data Architecture

### Type System
- **Shared TypeScript types** across frontend and backend
- Single source of truth in packages/shared
- Ensures type safety from database to UI

### Core Data Models
- **Mood** - User's mood levels with customization options
- **Activity** - Trackable activities with icons and categories
- **Entry** - Daily mood entries with associated activities and notes
- **Goal** - User-defined habit goals and tracking
- **User** - Authentication and user preferences

### Data Flow Pattern
**Offline-First with Background Sync:**
1. User creates/modifies entry → Immediately saved to Dexie (local)
2. UI updates instantly from local data
3. Background sync process pushes changes to Neon (cloud) when online
4. Periodic background fetch pulls server changes to local storage
5. Conflict resolution strategy: Last-write-wins with timestamps

## Deployment Strategy

### Continuous Deployment
- **GitHub repository** as single source of truth
- **GitHub Actions** workflow triggered on push to main branch
- Parallel deployment of frontend and backend

### Frontend Deployment (Cloudflare Pages)
- GitHub integration auto-detects changes in apps/web
- Builds SvelteKit application
- Deploys to Cloudflare's global edge network
- Environment variables configured in Cloudflare dashboard
- Preview deployments for pull requests

### Backend Deployment (Cloudflare Workers)
- Wrangler CLI deploys Hono API to Workers
- Automated via GitHub Actions
- Environment variables and secrets managed via Wrangler
- Database connection string stored as secret

### Environment Variables
**Frontend (.env):**
- API endpoint URL (Worker URL)
- Auth.js secret
- Google OAuth client ID

**Backend (Wrangler secrets):**
- Neon database connection string
- Auth.js secret
- Google OAuth client secret

## Development Workflow

### Local Development
- Root-level commands run all services in parallel
- API runs on localhost:8787 (Wrangler default)
- Web runs on localhost:5173 (Vite default)
- Hot reload enabled for both services
- Shared types update in real-time across workspaces

### Dependency Management
- pnpm handles workspace dependencies
- Shared packages linked via workspace protocol
- Single pnpm-lock.yaml at root level

### Version Control
- Conventional commits for clear history
- Feature branch workflow
- Main branch always deployable
- .gitignore excludes node_modules, build outputs, and environment files

## Data Synchronization

### Sync Architecture
**Bidirectional sync between Dexie (local) and Neon (cloud)**

### Sync Strategy
- **Push sync**: Local changes queued and sent to API when online
- **Pull sync**: Periodic fetch of server-side changes
- **Conflict resolution**: Timestamp-based last-write-wins
- **Sync state tracking**: Each entry has sync status (pending, synced, conflict)

### Offline Behavior
- Full app functionality available offline
- Queue system for pending server operations
- Sync indicator in UI shows connection status
- Automatic sync retry on connection restoration

## Security Considerations

### Authentication Security
- OAuth 2.0 flow via Google
- No password storage
- HTTP-only cookies prevent XSS attacks
- CSRF protection via Auth.js

### Data Privacy
- Each user's data isolated by user ID
- Server-side validation of ownership
- No sharing features (single-user app)

### API Security
- CORS configured for frontend domain only
- Rate limiting on Worker endpoints
- Input validation via TypeScript types
- Prepared statements via Drizzle ORM (SQL injection prevention)

## Performance Optimization

### Edge Computing
- Cloudflare Workers run at edge locations globally
- Reduced latency for API requests
- SvelteKit pages served from nearest edge location

### Caching Strategy
- Static assets cached via Cloudflare CDN
- API responses cached when appropriate
- IndexedDB serves as client-side cache

### Bundle Optimization
- SvelteKit code splitting
- Lazy loading for charts and statistics
- Tree shaking removes unused code
- Minimal dependencies in shared package

## Monitoring & Observability

### Logging
- Cloudflare Workers logs via Wrangler tail
- Pages deployment logs in Cloudflare dashboard
- Client-side errors logged to console (development)

### Analytics (Optional)
- Cloudflare Web Analytics (privacy-friendly)
- No personal data tracking
- Page views and performance metrics only

## Scalability Considerations

### Database
- Neon's autoscaling handles load automatically
- Connection pooling via Neon's HTTP interface
- Indexes on frequently queried fields (user_id, date)

### API
- Cloudflare Workers auto-scale infinitely
- Stateless design enables horizontal scaling
- No session storage in Workers (JWT-based)

### Frontend
- Static assets scale via CDN
- Client-side rendering reduces server load
- IndexedDB handles large local datasets efficiently

## Backup & Data Export

### User Data Export
- JSON export of all user data
- CSV export for spreadsheet analysis
- Includes all entries, moods, activities, and goals

### Backup Strategy
- Neon handles database backups automatically
- User responsible for exporting local data periodically
- GitHub repository contains all code (no data)

## Future Extensibility

### Designed for Growth
- Modular architecture allows adding features incrementally
- Shared types prevent API contract drift
- Database schema migrations via Drizzle
- Can add new OAuth providers easily via Auth.js

### Potential Enhancements
- Multi-device sync improvements
- Photo uploads to cloud storage
- Advanced statistics via separate analytics service
- Desktop app via Tauri (reusing SvelteKit frontend)
- Mobile app via Capacitor (reusing SvelteKit frontend)

## Development Tools

### Code Quality
- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting
- Type checking in CI/CD pipeline

### Testing (Future)
- Vitest for unit tests
- Playwright for e2e tests
- Test both offline and online scenarios

## Summary of Technology Choices

| Layer | Technology | Reason |
|-------|-----------|--------|
| Monorepo | pnpm workspaces | Simple, fast, great TypeScript support |
| Frontend | SvelteKit | Modern, fast, great DX, Cloudflare adapter |
| Backend | Hono | Lightweight, perfect for Workers, TypeScript-first |
| Database | Neon PostgreSQL | Serverless, edge-compatible, reliable |
| ORM | Drizzle | Type-safe, lightweight, great migrations |
| Local Storage | Dexie.js | Powerful IndexedDB wrapper, offline-first |
| Auth | Auth.js | Industry standard, SvelteKit integration |
| OAuth | Google | Ubiquitous, trusted, easy setup |
| Hosting | Cloudflare | Edge performance, free tier, integrated platform |
| CI/CD | GitHub Actions | Native GitHub integration, free for public repos |

## Cost Estimation

### Free Tier Usage
- **Cloudflare Pages**: 500 builds/month, unlimited requests
- **Cloudflare Workers**: 100k requests/day free
- **Neon**: 0.5GB storage, 10GB data transfer free
- **GitHub**: Free for public repositories
- **Google OAuth**: Free

**Expected monthly cost for personal use: $0**

(May incur costs only if usage significantly exceeds free tiers)