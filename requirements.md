# Campus EventHub - Comprehensive Requirements

**Note: This is a living document. AI Agents must update this file when new features or constraints are introduced.**

## 1. Project Concept
Campus EventHub is a centralized, SaaS-style event management platform for universities. It replaces Google Forms by providing a unified application shell where the UI dynamically changes based on the user's role and their specific relationship to an event (e.g., Participant vs. Organizer).

## 2. Dynamic Unified Interface
- **NO SEPARATE PORTALS**: The application uses a single unified shell (`/app`).
- **Contextual Navigation**: 
  - *Default*: Home, Explore Events, My Events, Certificates, Notifications, Profile.
  - *Organizer Context*: Adds Create Event, My Hosted Events, Manage Events.
  - *Admin Context*: Adds Admin Center, Users, System Health, Reports.
- **Contextual Actions**: Viewing an event shows "Register" if you are a student, but shows "Manage Event" (Registrations, Attendance, Payments) if you are the organizer of that specific event.

## 3. Core Features by Phase

### Phase 1: Foundation
- JWT Authentication & Unified User System.
- Event Creation (Wizard UI) & Event Discovery (Search/Filter).
- Event Details page.
- Registration logic.
- Dynamic Role/Permission UI based on event relationships.

### Phase 2: Advanced Registration
- Custom Registration Form Builder (Drag & drop/Add fields).
- Group/Team Registrations (min/max members, leader designation).
- Organizer Dashboard (Metrics, Charts, Recent Activity).
- Participant Management for organizers.

### Phase 3: Operations
- Payments integration (Razorpay ready, INR default).
- QR Registration Pass generation & PDF Ticket Download.
- QR Attendance Scanning (prevent duplicates via html5-qrcode).
- Real-time Announcements (Socket.io) and Email Broadcasts.
- Automated Email Notifications (Registration, Broadcasts, 24-hr Reminders).
- Live Q&A system for Events.
- Post-Event Feedback & 5-Star Rating System.

### Phase 4: Post-Event
- Results publishing (Winners, Runners-up).
- Automated Certificate Generation (Unique IDs, Verification QR).
- Public Certificate Verification page.

### Phase 5: Support & Admin
- Issue Reporting System (Categories, Priorities, Status tracking).
- Admin Support Center (Global oversight without micromanagement).
- System Health Monitoring & Audit Logs.

### Phase 6: Scalability
- Multi-college SaaS architecture (Multi-tenant ready from Day 1 via `collegeId`).
- Advanced Analytics.
- Push Notifications & PWA optimization.

## 4. UI/UX Principles
- **Theme**: Warm light theme, minimal, clean, professional SaaS dashboard aesthetic.
- **Design Elements**: Excellent spacing, rounded cards, subtle shadows, strong typography (Inter/Outfit).
- **Avoid**: Oversized components, excessive gradients, unnecessary decoration.
- **Requirements**: Must have loading states, empty states, error states, and toast notifications. Responsive mobile-first design.
