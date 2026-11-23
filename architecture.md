# Campus EventHub - Technical Architecture

**Note: This is a living document. AI Agents must update this file when architectural choices change.**

## 1. System Architecture (MERN SaaS)
- **Database:** MongoDB (using Mongoose ODM) with multi-tenant readiness via `collegeId`.
- **Backend:** Node.js / Express.js REST APIs.
- **Frontend:** React.js (Vite) Unified App Shell, Tailwind CSS, Shadcn/ui.
- **Real-time:** Socket.IO for WebSockets (Live Q&A, Live Notifications).
- **Background Jobs:** Node-Cron (for automated 24-hour event reminders).
- **Email Service:** Nodemailer for automated transactional emails (Tickets, Broadcasts).
- **Payments:** Razorpay architecture (currency: INR).

## 2. Dynamic RBAC & Permission Model
The system does not rely purely on static roles. It uses contextual permissions based on the user's relationship with the `Event` document.

**Base Roles (Stored in User):** `super_admin`, `admin`, `user`
**Contextual Relationships:**
- `isOrganizer`: True if `user._id === event.organizerId`
- `isParticipant`: True if `user._id` exists in the `Registrations` collection for this event.

**Permissions mapped to context:**
- Admin: `SYSTEM_MANAGE`, `EVENT_DELETE`, `ISSUE_MANAGE`
- Event Organizer: `EVENT_EDIT`, `REGISTRATION_MANAGE`, `ATTENDANCE_MANAGE`, `RESULT_MANAGE`
- Student/User: `EVENT_VIEW`, `EVENT_REGISTER`, `ISSUE_CREATE`

## 3. Database Schema Overview (Multi-Tenant Ready)

### Core Collections & Models
The system currently maintains 8 active Mongoose models with strict validation and compound indexing:
- **`users` (`User.js`)**: name, email (unique), phone, password, identityVerification (OCR extracted data & live photo), capabilities (`participant`, `organizer`, `volunteer`), profile, organizerProfile, paymentConfig (UPI & QR code).
- **`events` (`Event.js`)**: title, description, date, time, venue, category, isPaid, price, capacity, organizerId (ref: User), coordinators array, participationType, maxGroupSize, registeredCount, announcements, ratings (1-5 stars & reviews), isHackathon, problemStatements, results.
- **`registrations` (`Registration.js`)**: userId (ref: User), eventId (ref: Event), participantName, email, phone, participationType, teamCode (sparse unique index), isTeamLeader, teamSize, joinedTeamCode, status, paymentStatus, paymentProof, preferences, projectSubmission, ticketTierId, customAnswers. Compound unique index on `(userId + eventId)`.
- **`queries` (`Query.js`)**: eventId (ref: Event), user (id, name), text, isResolved, replies array (sender, text, timestamp) for real-time WebSocket Q&A.
- **`schedules` (`Schedule.js`)**: userId (ref: User), eventId (ref: Event), startTime, endTime. Compound unique index on `(userId + eventId)`.
- **`notifications` (`Notification.js`)**: userId (ref: User), title, message, type (info, success, warning), isRead, link.
- **`logs` (`Log.js`)**: level, message, context, userId, url, details, createdAt. Automated TTL index with 30-day expiration (`expireAfterSeconds: 2592000`).
- **`admins` (`Admin.js`)**: name, email (unique), password, isSuperAdmin, permissions array.

### Visual Architecture & Model Diagrams
The complete visual architecture diagram and model cards are generated and maintained in:
- Master Schema Map: `docs/assets/images/campus-eventhub-models-collection.png`
- Individual Model Diagrams: `docs/assets/images/models/model_*.png`
- LinkedIn Showcase Banner: `docs/assets/images/campus-eventhub-linkedin-showcase.png`
- GitHub README Banner: `docs/assets/images/campus-eventhub-github-banner.png`

### Security Architecture & Route Guards
- **Strict Public Projection (PII Protection)**: Public event discovery (`GET /api/events` and `GET /api/events/:id`) restricts populated organizer fields to safe public attributes (`name`, `organizerProfile.organizationName`, `organizerProfile.logo`), completely preventing leak of sensitive user fields (`email`, `phone`, `password`, `tokens`).
- **Guard Layer**:
  - `protect`: Strict JWT verification for administrative, state-modifying, AI, and participant actions.
  - `optionalAuth`: Graceful user identity attachment for public browsing without breaking guest discovery.
  - `requireOrganizer`: Role and verification status verification.
- **AI Microservice Shielding**: `/api/ai/*` routes are protected with `protect` to prevent unauthenticated NLP resource exhaustion.
- **Dedicated Rate Limiters**: `loginLimiter` (max 20 / 15m) and `registerLimiter` (max 10 / 15m) mitigate credential stuffing and automated bot registration.

### 4. API Design (RESTful)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Events
- `GET /api/events` (Discovery - Public)
- `POST /api/events` (Create - Requires Auth)
- `GET /api/events/:id`
- `PUT /api/events/:id` (Requires `isOrganizer` or `Admin`)
- `POST /api/events/:id/register`
- `GET /api/events/:id/registrations` (Requires `isOrganizer`)

### Operations
- `POST /api/events/:id/attendance`
- `POST /api/payments/create`
- `POST /api/payments/verify`

### Support
- `POST /api/issues`
- `GET /api/admin/issues`

### Frontend Architecture
**Unified App Shell (`/app`)**: Navigation rendered conditionally.
- **State Management:** `AuthContext.jsx` manages the global user state and persists the JWT in `localStorage`.
- **API Client:** `services/api.js` provides an Axios instance with an interceptor that automatically attaches the JWT to the `Authorization` header.
- **Routing**: React Router maps `/` to Landing, `/login` and `/register` for Auth, and `/dashboard` for the main event discovery view.
- **Components**: `Navbar` & `Footer` (shared layouts), `Sidebar`, `EventCard` (styled using the Light SaaS theme).
