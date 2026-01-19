# Moodio Clone - API & Types Specification

## Type Definitions

### Core Domain Types

#### User
```typescript
interface User {
  id: string;                    // UUID from database
  email: string;                 // From Google OAuth
  name: string | null;           // Display name from Google
  picture: string | null;        // Profile picture URL from Google
  createdAt: Date;
  updatedAt: Date;
}
```

#### Mood
```typescript
interface Mood {
  id: string;                    // UUID
  userId: string;                // Owner of this mood config
  name: string;                  // "Rad", "Good", "Meh", "Bad", "Awful"
  value: number;                 // 5, 4, 3, 2, 1 (for calculations/sorting)
  color: string;                 // Hex color "#4CAF50"
  icon: string;                  // Emoji or icon identifier "😄"
  order: number;                 // Display order (1-5)
  isDefault: boolean;            // True for system defaults, false for custom
  createdAt: Date;
  updatedAt: Date;
}
```

#### Activity
```typescript
interface Activity {
  id: string;                    // UUID
  userId: string;                // Owner of this activity
  name: string;                  // "Exercise", "Work", "Friends"
  icon: string;                  // Emoji or icon identifier "🏃"
  color: string;                 // Hex color for grouping/display
  category: string | null;       // "Health", "Social", "Work", etc.
  isDefault: boolean;            // True for system defaults
  createdAt: Date;
  updatedAt: Date;
}
```

#### Entry
```typescript
interface Entry {
  id: string;                    // UUID
  userId: string;                // Owner of this entry
  date: string;                  // ISO date "2024-01-15"
  time: string;                  // ISO time "14:30:00"
  moodId: string;                // Reference to Mood
  activityIds: string[];         // Array of Activity IDs
  note: string | null;           // Optional text note
  photos: string[] | null;       // Optional photo URLs (future feature)
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date | null;         // Last sync timestamp for conflict resolution
}
```

### Enriched Types (For Client Display)

#### EnrichedEntry
```typescript
interface EnrichedEntry {
  id: string;
  userId: string;
  date: string;
  time: string;
  mood: Mood;                    // Full mood object instead of ID
  activities: Activity[];        // Full activity objects instead of IDs
  note: string | null;
  photos: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date | null;
}
```

### Request/Response Types

#### CreateEntryRequest
```typescript
interface CreateEntryRequest {
  date: string;                  // ISO date, defaults to today if not provided
  time: string;                  // ISO time, defaults to now if not provided
  moodId: string;                // Required
  activityIds: string[];         // Can be empty array
  note?: string;                 // Optional
}
```

#### UpdateEntryRequest
```typescript
interface UpdateEntryRequest {
  date?: string;
  time?: string;
  moodId?: string;
  activityIds?: string[];
  note?: string;
}
```

#### CreateActivityRequest
```typescript
interface CreateActivityRequest {
  name: string;                  // Required, max 50 chars
  icon: string;                  // Required, emoji or icon name
  color: string;                 // Required, hex color
  category?: string;             // Optional, max 30 chars
}
```

#### UpdateActivityRequest
```typescript
interface UpdateActivityRequest {
  name?: string;
  icon?: string;
  color?: string;
  category?: string;
}
```

#### UpdateMoodRequest
```typescript
interface UpdateMoodRequest {
  name?: string;                 // Update display name
  color?: string;                // Update color
  icon?: string;                 // Update icon
  order?: number;                // Update display order
}
```

#### SyncRequest
```typescript
interface SyncRequest {
  lastSyncedAt: string;          // ISO timestamp of last successful sync
  entries: Entry[];              // All entries modified since last sync
}
```

#### SyncResponse
```typescript
interface SyncResponse {
  serverEntries: Entry[];        // All entries modified on server since lastSyncedAt
  conflicts: Conflict[];         // Entries with conflicting changes
  syncedAt: string;              // New sync timestamp to store locally
}
```

#### Conflict
```typescript
interface Conflict {
  entryId: string;
  localEntry: Entry;             // Client's version
  serverEntry: Entry;            // Server's version
  resolution: 'use_server' | 'use_local' | 'manual';
}
```

### Statistics Types

#### MoodStatistics
```typescript
interface MoodStatistics {
  totalEntries: number;
  currentStreak: number;         // Consecutive days with entries
  longestStreak: number;
  moodDistribution: MoodDistribution[];
  averageMood: number;           // Weighted average based on mood values
  moodOverTime: MoodOverTime[];
}
```

#### MoodDistribution
```typescript
interface MoodDistribution {
  moodId: string;
  moodName: string;
  moodColor: string;
  count: number;
  percentage: number;
}
```

#### MoodOverTime
```typescript
interface MoodOverTime {
  date: string;                  // ISO date
  averageMood: number;           // Average mood value for that day
  entryCount: number;            // Number of entries that day
}
```

#### ActivityStatistics
```typescript
interface ActivityStatistics {
  activityId: string;
  activityName: string;
  activityIcon: string;
  totalCount: number;            // How many times used
  averageMoodWithActivity: number; // Average mood when this activity present
  moodCorrelation: number;       // -1 to 1, correlation with good moods
}
```

#### DateRangeQuery
```typescript
interface DateRangeQuery {
  startDate: string;             // ISO date "2024-01-01"
  endDate: string;               // ISO date "2024-01-31"
}
```

### Error Types

#### ApiError
```typescript
interface ApiError {
  error: string;                 // Error message
  code: string;                  // Error code: "UNAUTHORIZED", "NOT_FOUND", etc.
  details?: Record<string, any>; // Additional error context
}
```

#### ValidationError
```typescript
interface ValidationError extends ApiError {
  code: "VALIDATION_ERROR";
  fields: FieldError[];
}

interface FieldError {
  field: string;                 // Field name that failed validation
  message: string;               // Human-readable error message
}
```

## API Endpoints

### Base URL
- Production: `https://Moodio-api.{username}.workers.dev`
- Development: `http://localhost:8787`

### Authentication
All endpoints (except /auth/*) require authentication via JWT in cookies or Authorization header.

---

## Authentication Endpoints

### POST /auth/signin
**Description**: Initiate Google OAuth sign-in flow  
**Auth Required**: No  
**Request Body**: None  
**Response**: Redirects to Google OAuth consent screen

---

### GET /auth/callback
**Description**: OAuth callback handler  
**Auth Required**: No  
**Query Parameters**:
- `code`: string (OAuth authorization code)
- `state`: string (CSRF token)

**Response**: Redirects to app with session cookie set

---

### POST /auth/signout
**Description**: Sign out user and clear session  
**Auth Required**: Yes  
**Request Body**: None  
**Response**: 
```typescript
{ success: true }
```

---

### GET /auth/session
**Description**: Get current user session  
**Auth Required**: Yes  
**Response**: 
```typescript
{
  user: User;
  expiresAt: string;  // ISO timestamp
}
```

**Error Responses**:
- 401: Not authenticated

---

## User Endpoints

### GET /api/user/me
**Description**: Get current user profile  
**Auth Required**: Yes  
**Response**: `User`

---

### PUT /api/user/me
**Description**: Update user profile (name only, email from OAuth)  
**Auth Required**: Yes  
**Request Body**:
```typescript
{
  name?: string;
}
```
**Response**: `User`

---

## Mood Endpoints

### GET /api/moods
**Description**: Get all moods for current user  
**Auth Required**: Yes  
**Response**: `Mood[]`

**Notes**:
- Returns default moods + user's custom moods
- Sorted by `order` field

---

### GET /api/moods/:id
**Description**: Get single mood by ID  
**Auth Required**: Yes  
**Response**: `Mood`

**Error Responses**:
- 404: Mood not found or doesn't belong to user

---

### PUT /api/moods/:id
**Description**: Update mood customization  
**Auth Required**: Yes  
**Request Body**: `UpdateMoodRequest`  
**Response**: `Mood`

**Notes**:
- Can only update moods that belong to user
- Cannot change `value` field (maintains calculation consistency)

**Error Responses**:
- 400: Validation error
- 404: Mood not found

---

### POST /api/moods/reset
**Description**: Reset moods to system defaults  
**Auth Required**: Yes  
**Request Body**: None  
**Response**: `Mood[]`

**Notes**:
- Deletes all custom mood configurations
- Restores default 5 moods
- Existing entries remain valid (reference mood IDs remain)

---

## Activity Endpoints

### GET /api/activities
**Description**: Get all activities for current user  
**Auth Required**: Yes  
**Response**: `Activity[]`

**Notes**:
- Returns default activities + user's custom activities
- Sorted alphabetically by name

---

### GET /api/activities/:id
**Description**: Get single activity by ID  
**Auth Required**: Yes  
**Response**: `Activity`

**Error Responses**:
- 404: Activity not found or doesn't belong to user

---

### POST /api/activities
**Description**: Create custom activity  
**Auth Required**: Yes  
**Request Body**: `CreateActivityRequest`  
**Response**: `Activity`

**Validation**:
- name: 1-50 characters, required
- icon: required
- color: valid hex color, required
- category: max 30 characters, optional

**Error Responses**:
- 400: Validation error
- 409: Activity with same name already exists

---

### PUT /api/activities/:id
**Description**: Update activity  
**Auth Required**: Yes  
**Request Body**: `UpdateActivityRequest`  
**Response**: `Activity`

**Notes**:
- Can update both default and custom activities
- Updates reflect immediately in all entries using this activity

**Error Responses**:
- 400: Validation error
- 404: Activity not found

---

### DELETE /api/activities/:id
**Description**: Delete custom activity  
**Auth Required**: Yes  
**Response**: 
```typescript
{ success: true }
```

**Notes**:
- Cannot delete default activities
- Cannot delete if used in any entries (returns 409)
- Returns 404 if activity doesn't exist or doesn't belong to user

**Error Responses**:
- 403: Cannot delete default activity
- 404: Activity not found
- 409: Activity is used in entries

---

## Entry Endpoints

### GET /api/entries
**Description**: Get all entries for current user  
**Auth Required**: Yes  
**Query Parameters**:
- `startDate`: string (ISO date, optional)
- `endDate`: string (ISO date, optional)
- `enriched`: boolean (default: false)

**Response**: `Entry[]` or `EnrichedEntry[]` (if enriched=true)

**Notes**:
- Without date filters: returns all entries
- With date filters: returns entries in range (inclusive)
- Sorted by date DESC, time DESC (newest first)
- Use `enriched=true` for display (includes full mood/activity objects)

---

### GET /api/entries/:id
**Description**: Get single entry by ID  
**Auth Required**: Yes  
**Query Parameters**:
- `enriched`: boolean (default: false)

**Response**: `Entry` or `EnrichedEntry`

**Error Responses**:
- 404: Entry not found or doesn't belong to user

---

### GET /api/entries/date/:date
**Description**: Get all entries for specific date  
**Auth Required**: Yes  
**Path Parameters**:
- `date`: string (ISO date "2024-01-15")

**Query Parameters**:
- `enriched`: boolean (default: false)

**Response**: `Entry[]` or `EnrichedEntry[]`

**Notes**:
- Returns empty array if no entries for that date
- Sorted by time DESC

---

### POST /api/entries
**Description**: Create new entry  
**Auth Required**: Yes  
**Request Body**: `CreateEntryRequest`  
**Response**: `Entry`

**Validation**:
- moodId: must exist and belong to user
- activityIds: all must exist and belong to user
- date: valid ISO date
- time: valid ISO time
- note: max 1000 characters

**Error Responses**:
- 400: Validation error
- 404: Invalid moodId or activityId

---

### PUT /api/entries/:id
**Description**: Update existing entry  
**Auth Required**: Yes  
**Request Body**: `UpdateEntryRequest`  
**Response**: `Entry`

**Notes**:
- Only updates provided fields
- Updates `updatedAt` timestamp
- Validates mood/activity IDs if provided

**Error Responses**:
- 400: Validation error
- 404: Entry not found or invalid references

---

### DELETE /api/entries/:id
**Description**: Delete entry  
**Auth Required**: Yes  
**Response**: 
```typescript
{ success: true }
```

**Error Responses**:
- 404: Entry not found or doesn't belong to user

---

## Statistics Endpoints

### GET /api/stats/overview
**Description**: Get overview statistics  
**Auth Required**: Yes  
**Query Parameters**: `DateRangeQuery` (optional)

**Response**: `MoodStatistics`

**Notes**:
- Without date range: all-time stats
- With date range: stats for that period

---

### GET /api/stats/moods
**Description**: Get mood distribution and trends  
**Auth Required**: Yes  
**Query Parameters**: `DateRangeQuery` (optional)

**Response**:
```typescript
{
  distribution: MoodDistribution[];
  overTime: MoodOverTime[];
  averageMood: number;
}
```

---

### GET /api/stats/activities
**Description**: Get activity statistics and correlations  
**Auth Required**: Yes  
**Query Parameters**: `DateRangeQuery` (optional)

**Response**: `ActivityStatistics[]`

**Notes**:
- Sorted by totalCount DESC
- Only includes activities that have been used at least once
- moodCorrelation indicates if activity is associated with better/worse moods

---

### GET /api/stats/streaks
**Description**: Get streak information  
**Auth Required**: Yes  
**Response**:
```typescript
{
  currentStreak: number;      // Days
  longestStreak: number;      // Days
  totalDaysLogged: number;
  streakHistory: Array<{
    startDate: string;
    endDate: string;
    length: number;
  }>;
}
```

---

## Sync Endpoints

### POST /api/sync
**Description**: Bidirectional sync between client and server  
**Auth Required**: Yes  
**Request Body**: `SyncRequest`  
**Response**: `SyncResponse`

**Notes**:
- Client sends all locally modified entries since last sync
- Server returns all server-side changes since lastSyncedAt
- Conflicts detected via timestamp comparison
- Default resolution: last-write-wins (newest updatedAt wins)

**Conflict Resolution Strategy**:
1. Compare `updatedAt` timestamps
2. If server is newer: client updates local copy
3. If client is newer: server accepts client version
4. If exactly equal: no conflict (idempotent)

---

### GET /api/sync/status
**Description**: Check sync status without syncing  
**Auth Required**: Yes  
**Query Parameters**:
- `lastSyncedAt`: string (ISO timestamp)

**Response**:
```typescript
{
  hasChanges: boolean;         // Server has changes for client
  changeCount: number;         // Number of entries modified on server
  lastServerUpdate: string;    // ISO timestamp of most recent server change
}
```

**Notes**:
- Lightweight endpoint to check if sync needed
- Client can poll this periodically

---

## Data Management Endpoints

### GET /api/export
**Description**: Export all user data  
**Auth Required**: Yes  
**Query Parameters**:
- `format`: "json" | "csv" (default: "json")

**Response**: 
- JSON: Complete data dump of all user data
- CSV: Entries in spreadsheet format

**JSON Export Format**:
```typescript
{
  user: User;
  moods: Mood[];
  activities: Activity[];
  entries: EnrichedEntry[];
  exportedAt: string;
  version: string;            // Export format version
}
```

---

### POST /api/import
**Description**: Import data from export file  
**Auth Required**: Yes  
**Request Body**: JSON export format  
**Response**:
```typescript
{
  imported: {
    moods: number;
    activities: number;
    entries: number;
  };
  skipped: number;           // Duplicates or invalid entries
  errors: string[];
}
```

**Notes**:
- Validates all data before import
- Skips duplicates (based on ID or date+time)
- Merges with existing data, doesn't replace

---

### DELETE /api/data/clear
**Description**: Delete all user data (dangerous!)  
**Auth Required**: Yes  
**Request Body**:
```typescript
{
  confirm: string;            // Must be "DELETE_ALL_DATA"
}
```
**Response**:
```typescript
{
  success: true;
  deleted: {
    entries: number;
    customMoods: number;
    customActivities: number;
  };
}
```

**Notes**:
- Requires explicit confirmation
- Deletes all entries
- Resets moods and activities to defaults
- Does not delete user account

---

## Rate Limiting

All endpoints are rate-limited per user:
- **Authentication endpoints**: 10 requests per minute
- **Read endpoints** (GET): 100 requests per minute
- **Write endpoints** (POST/PUT/DELETE): 50 requests per minute
- **Sync endpoint**: 20 requests per minute
- **Export endpoint**: 5 requests per hour

Rate limit headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Error Response Format

All errors follow consistent format:

```typescript
{
  error: string;              // Human-readable message
  code: string;               // Machine-readable code
  details?: any;              // Additional context
}
```

**Common Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Authenticated but not allowed
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## HTTP Status Codes

- **200**: Success
- **201**: Created (POST endpoints)
- **400**: Bad request (validation error)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (authenticated but not allowed)
- **404**: Not found
- **409**: Conflict (duplicate or constraint violation)
- **429**: Rate limited
- **500**: Internal server error

## Authentication Flow

1. Client initiates: `POST /auth/signin`
2. Redirects to Google OAuth
3. User approves
4. Google redirects to: `GET /auth/callback?code=...`
5. Server exchanges code for tokens
6. Server creates user in DB (if new)
7. Server sets HTTP-only session cookie
8. Server redirects to app
9. All subsequent API calls include session cookie

## CORS Configuration

Allowed origins:
- Production: `https://{project-name}.pages.dev`
- Development: `http://localhost:5173`

Allowed methods: GET, POST, PUT, DELETE, OPTIONS  
Allowed headers: Content-Type, Authorization  
Credentials: true (for cookies)

## Caching Strategy

**Client-side caching**:
- Moods: Cache indefinitely (rarely change)
- Activities: Cache indefinitely (rarely change)
- Entries: No caching (always fresh)
- Stats: Cache for 5 minutes

**Server-side caching**:
- None initially (premature optimization)
- Consider caching stats calculations if performance issues arise

## Database Indexes

Required indexes for performance:
- `entries(userId, date DESC)`
- `entries(userId, updatedAt DESC)` for sync
- `activities(userId)`
- `moods(userId)`

## Type Safety

All types defined in `packages/shared/src/types.ts`  
Exported and used by:
- Frontend: Type-safe API calls
- Backend: Type-safe request/response handling
- Database: Drizzle schema matches types

No type casting or `any` types in production code.