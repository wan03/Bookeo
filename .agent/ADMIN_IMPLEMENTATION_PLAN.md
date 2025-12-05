# Admin Dashboard Implementation Plan

## 1. Executive Summary
We will build a premium, "God-mode" Admin Dashboard for Bookeo. This dashboard will serve as the command center for platform administrators to monitor KPIs, manage users and businesses, and oversee the influencer barter system. The design will be sleek, modern (Glassmorphism/Dark Mode), and highly responsive.

## 2. Key Performance Indicators (KPIs) & Metrics
Based on the SaaS booking model, we will track the following high-impact metrics:

### Platform Health
- **Total Revenue (GMV)**: Gross Merchandise Value flowing through the platform.
- **Take Rate / Net Revenue**: If we charge a commission (future proofing).
- **Active Users**: Daily/Monthly Active Users (DAU/MAU).
- **Churn Rate**: Users/Businesses who haven't logged in for 30+ days.

### Marketplace Liquidity
- **Booking Volume**: Total bookings vs. Completed bookings.
- **Fill Rate**: % of available slots that are booked (Utilization).
- **Business Growth**: New business signups vs. Verified businesses.

### Influencer Ecosystem
- **Barter Velocity**: Number of offers created vs. applications submitted.
- **Content Output**: Number of content submissions approved.

## 3. Architecture & Routing

### Route Structure
We will create a new protected route group `(admin)` to isolate admin logic.

- `/admin` (Dashboard Overview)
- `/admin/users` (User Management)
- `/admin/businesses` (Business Directory & Verification)
- `/admin/bookings` (Global Booking Logs)
- `/admin/influencers` (Barter System Oversight)
- `/admin/settings` (Platform Configuration)

### Security (RBAC)
- **Middleware/Guard**: A Higher-Order Component (HOC) or layout check `if (profile.role !== 'admin') redirect('/')`.
- **RLS**: Ensure Supabase RLS policies allow `admin` role to bypass standard restrictions (or create specific `admin` policies).

## 4. Feature Breakdown

### A. Dashboard Overview (`/admin/page.tsx`)
**Visuals**: Grid of "Stat Cards" with sparkline charts (using Recharts).
- **Top Row**: Total Revenue, Total Bookings, Active Businesses, Pending Verifications.
- **Main Chart**: Revenue & Booking volume over time (Line/Area Chart).
- **Recent Activity Feed**: Live stream of new user signups, bookings, and reviews.

### B. Business Management (`/admin/businesses/page.tsx`)
**Goal**: Verify and manage service providers.
- **Verification Queue**: Filterable list of businesses where `is_verified = false`.
- **Quick Actions**: "Verify", "Reject", "Suspend".
- **Details View**: Modal or page to view business proofs, location, and services.

### C. User Management (`/admin/users/page.tsx`)
**Goal**: Customer support and moderation.
- **Search**: Fuzzy search by name, email, or phone.
- **Role Management**: Ability to promote/demote users (e.g., make someone an admin).
- **Ban System**: (Future) Add `banned_at` to profiles to lock out bad actors.

### D. Influencer & Barter Oversight (`/admin/influencers/page.tsx`)
**Goal**: Monitor the "Creator Economy" aspect.
- **Content Moderation**: View reported content or audit random submissions.
- **Top Creators**: Leaderboard based on `reputation_score`.

## 5. Technical Implementation Steps

### Step 1: Database & Backend
1.  **Admin Actions**: Create `app/actions/admin.ts` for privileged operations.
    - `getAdminStats()`: Aggregated counts (optimized SQL).
    - `verifyBusiness(id)`: Update `is_verified`.
    - `getUsers(page, query)`: Paginated user fetch.
2.  **SQL Optimization**: Create Database Views for complex stats if performance lags.

### Step 2: UI Components (Design System)
1.  `AdminLayout`: Sidebar navigation with glass effect, sticky header.
2.  `StatCard`: Props: `title`, `value`, `trend` (up/down %), `icon`.
3.  `DataGrid`: Reusable table component with sorting, pagination, and row actions.
4.  `StatusBadge`: Color-coded pills (e.g., Green for 'Verified', Yellow for 'Pending').

### Step 3: Page Construction
1.  Scaffold `/admin` routes.
2.  Implement the **Dashboard Overview** first to establish the visual language.
3.  Implement **Business Verification** (Critical workflow).

## 6. Design Aesthetic
- **Theme**: Dark, professional, "Command Center" vibe.
- **Colors**: Deep blues/grays for background, vibrant accents (Neon Blue/Purple) for data visualization.
- **Interactions**: Hover effects on table rows, smooth transitions between tabs.

## 7. End-to-End Testing Strategy (Playwright)

### Test File Structure
We will create a comprehensive test suite at `tests/admin-workflow.spec.ts` that validates the entire admin experience.

### Test Coverage Areas

#### A. Admin Authentication & Access Control
**Test**: `Admin can login and access admin dashboard`
- Login with admin credentials
- Verify redirect to `/admin` dashboard
- Verify admin navigation is visible

**Test**: `Non-admin users are blocked from admin routes`
- Login as regular user/business owner
- Attempt to navigate to `/admin`
- Verify redirect to home page or 403 error

#### B. Dashboard Overview Tests
**Test**: `Dashboard displays all KPI metrics`
- Navigate to `/admin`
- Verify presence of stat cards: Total Revenue, Total Bookings, Active Businesses, Pending Verifications
- Verify numbers are displayed (not loading state)
- Verify chart renders with data

**Test**: `Recent activity feed updates in real-time`
- Verify activity feed shows recent events
- Verify pagination or "Load More" functionality

#### C. Business Verification Workflow
**Test**: `Admin can verify a pending business`
- Navigate to `/admin/businesses`
- Filter for unverified businesses (`is_verified = false`)
- Click on a business to view details
- Click "Verify" button
- Verify success message appears
- Verify business moves to verified list
- Verify business owner can now access full features

**Test**: `Admin can reject a business application`
- Navigate to verification queue
- Select a business
- Click "Reject" with reason
- Verify business status updates
- Verify notification sent to business owner

#### D. User Management Tests
**Test**: `Admin can search and filter users`
- Navigate to `/admin/users`
- Use search bar to find user by email
- Verify search results display correctly
- Test filters (role, status, date joined)

**Test**: `Admin can change user roles`
- Search for a specific user
- Click "Edit Role" or similar action
- Change role from 'consumer' to 'business_owner'
- Save changes
- Verify role updated in database
- Verify user sees new permissions on next login

**Test**: `Admin can view user activity history`
- Click on a user profile
- Verify booking history displays
- Verify review history displays
- Verify account creation date and last login

#### E. Influencer & Barter Oversight
**Test**: `Admin can view all barter offers and applications`
- Navigate to `/admin/influencers`
- Verify list of all barter offers displays
- Click on an offer to see applications
- Verify application details (influencer profile, status)

**Test**: `Admin can moderate content submissions`
- View pending content submissions
- Click on a submission to review
- Approve or reject with feedback
- Verify status updates correctly

**Test**: `Admin can view influencer leaderboard`
- Navigate to influencer section
- Verify top creators by reputation_score
- Verify badges and metrics display correctly

#### F. Booking Management Tests
**Test**: `Admin can view all platform bookings`
- Navigate to `/admin/bookings`
- Verify global booking list displays
- Test filters: date range, status, business
- Verify pagination works

**Test**: `Admin can manually cancel or modify bookings`
- Select a booking
- Click "Cancel" or "Modify"
- Add admin note/reason
- Verify booking status updates
- Verify notifications sent to affected parties

#### G. Platform Settings Tests
**Test**: `Admin can update platform configuration`
- Navigate to `/admin/settings`
- Update settings (e.g., commission rate, feature flags)
- Save changes
- Verify settings persist after page reload

### Test Data Setup
**Fixture**: `tests/fixtures/admin-test-data.ts`
- Create test admin user
- Create test businesses (verified and unverified)
- Create test bookings across different statuses
- Create test barter offers and applications

### Test Execution Strategy
1. **Sequential Execution**: Admin tests should run sequentially to avoid race conditions on shared data
2. **Cleanup**: Each test should clean up created data or use unique identifiers
3. **Assertions**: Use `expect().toBeVisible()` with timeouts for async operations
4. **Error Handling**: Test both success and failure paths

### Performance Benchmarks
- Dashboard load time: < 2 seconds
- Search results: < 1 second
- Bulk operations (verify multiple businesses): < 5 seconds

## 8. Immediate Next Steps
1.  **Database Migration**: Add admin-specific RLS policies and views for aggregated stats
2.  **Create Admin Test User**: Add to `TEST_USERS.md` and seed script
3.  **Build Backend Actions**: Create `app/actions/admin.ts` with all privileged operations
4.  **Create AdminLayout**: Build the protected layout with sidebar navigation
5.  **Implement Dashboard**: Build the main `/admin` page with KPI cards
6.  **Write E2E Tests**: Create `tests/admin-workflow.spec.ts` following the test plan above
7.  **Iterate**: Build remaining admin pages (businesses, users, influencers) with tests for each
