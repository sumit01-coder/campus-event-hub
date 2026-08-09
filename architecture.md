# Campus EventHub - Technical Architecture

**Note: This is a living document. AI Agents must update this file when architectural choices change.**

## 1. System Architecture (MERN SaaS)
- **Database:** MongoDB (using Mongoose ODM) with multi-tenant readiness via `collegeId`.
- **Backend:** Node.js / Express.js REST APIs.
- **Frontend:** React.js (Vite) Unified App Shell, Tailwind CSS, Shadcn/ui.
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

### Core Collections
- **`users`**: name, email, password, role, `collegeId`, profile_details.
- **`events`**: title, description, coverImage, dates, venue, rules, `organizerId` (User ref), `collegeId`.
- **`eventActivities`**: sub-events mapped to a parent event.
- **`venues`**: Official campus locations.

### Registration & Finance
- **`registrationForms`**: Custom JSON structure defining the fields organizers requested.
- **`registrations`**: user, event, status, formData JSON, team (optional), qrData.
- **`teams`**: name, leader, members array.
- **`payments`**: orderId, paymentId, amount, status (Pending, Success, Failed), user, event, registrationId.

### Operations & Post-Event
- **`attendance`**: user, event, timestamp, scannedBy.
- **`announcements`**: event, title, body, author.
- **`results`**: event, participant/team, position, prize.
- **`certificates`**: user, event, uniqueId, type.

### Support & System
- **`issues`**: title, description, category, priority, status, reporter.
- **`auditLogs`**: user, action, entity, timestamp.
- **`notifications`**: user, type, message, read_status.

## 4. API Design (RESTful)

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
