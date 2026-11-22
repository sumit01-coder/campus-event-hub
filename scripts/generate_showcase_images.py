import asyncio
import os
import shutil
from playwright.async_api import async_playwright

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_IMG_DIR = os.path.join(BASE_DIR, "docs", "assets", "images")
MODELS_IMG_DIR = os.path.join(DOCS_IMG_DIR, "models")
SCREENSHOTS_DIR = os.path.join(DOCS_IMG_DIR, "screenshots")
FRONTEND_SHOWCASE_DIR = os.path.join(BASE_DIR, "frontend", "public", "showcase")

for d in [DOCS_IMG_DIR, MODELS_IMG_DIR, SCREENSHOTS_DIR, FRONTEND_SHOWCASE_DIR]:
    os.makedirs(d, exist_ok=True)

# Common styling template
BASE_STYLE = """
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #090d16;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .glass-card {
    background: rgba(17, 24, 39, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px -10px var(--glow-color, rgba(99, 102, 241, 0.2));
  }
  .tag {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-block;
  }
  .tag-required { background: rgba(239, 68, 68, 0.18); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
  .tag-unique { background: rgba(168, 85, 247, 0.18); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.3); }
  .tag-ref { background: rgba(59, 130, 246, 0.18); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
  .tag-enum { background: rgba(245, 158, 11, 0.18); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.3); }
  .tag-indexed { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
  .field-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 13px;
  }
  .field-row:last-child { border-bottom: none; }
  .field-name { font-weight: 600; color: #f1f5f9; display: flex; align-items: center; gap: 8px; }
  .field-type { font-family: monospace; color: #94a3b8; font-size: 12px; }
  .field-meta { display: flex; gap: 6px; align-items: center; }
  .section-title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #64748b;
    font-weight: 700;
    padding: 8px 14px 4px 14px;
  }
</style>
"""

MODELS_DATA = [
    {
        "id": "user",
        "name": "User Model",
        "collection": "users",
        "icon": "👤",
        "color": "#6366f1",
        "glow": "rgba(99, 102, 241, 0.35)",
        "badge": "Core Identity & RBAC",
        "desc": "Represents students, organizers, and volunteers with AI identity verification & contextual permissions.",
        "sections": [
            {
                "title": "Account & Credentials",
                "fields": [
                    {"name": "name", "type": "String", "tags": ["required"]},
                    {"name": "email", "type": "String (RFC Regex)", "tags": ["required", "unique"]},
                    {"name": "phone", "type": "String", "tags": ["required"]},
                    {"name": "password", "type": "String (bcrypt hash)", "tags": ["required"]},
                    {"name": "isEmailVerified", "type": "Boolean (default: false)", "tags": []},
                    {"name": "emailVerificationToken", "type": "String", "tags": []}
                ]
            },
            {
                "title": "AI Identity Verification (Live Photo & ID)",
                "fields": [
                    {"name": "identityVerification.livePhoto", "type": "String (URL)", "tags": []},
                    {"name": "identityVerification.idCardPhoto", "type": "String (URL)", "tags": []},
                    {"name": "identityVerification.status", "type": "String", "tags": ["enum"]},
                    {"name": "identityVerification.extractedData", "type": "Object (name, id, mob, univ)", "tags": []},
                    {"name": "identityVerification.confidence", "type": "Number (0.0 - 1.0)", "tags": []}
                ]
            },
            {
                "title": "Contextual Capabilities & Profile",
                "fields": [
                    {"name": "capabilities", "type": "{ participant, organizer, volunteer }", "tags": []},
                    {"name": "profile", "type": "{ college, department, course, year, studentId }", "tags": []},
                    {"name": "organizerProfile", "type": "{ orgName, orgType, designation, logo, status }", "tags": ["enum"]},
                    {"name": "paymentConfig", "type": "{ qrCode, upiId }", "tags": []}
                ]
            }
        ]
    },
    {
        "id": "event",
        "name": "Event Model",
        "collection": "events",
        "icon": "🎪",
        "color": "#8b5cf6",
        "glow": "rgba(139, 92, 246, 0.35)",
        "badge": "Event & Hackathon Engine",
        "desc": "Central event entity powering seminars, hackathons, and workshops with custom workflows.",
        "sections": [
            {
                "title": "Event Specifications",
                "fields": [
                    {"name": "title", "type": "String", "tags": ["required"]},
                    {"name": "description", "type": "String (Markdown/Rich)", "tags": ["required"]},
                    {"name": "date & time", "type": "Date, String", "tags": ["required"]},
                    {"name": "venue", "type": "String (Campus / Hall)", "tags": ["required"]},
                    {"name": "category", "type": "tech | music | workshop | sports...", "tags": ["required", "enum"]},
                    {"name": "isPaid, price", "type": "Boolean, Number", "tags": []},
                    {"name": "capacity, registeredCount", "type": "Number, Number", "tags": ["required"]}
                ]
            },
            {
                "title": "Roles & Access Control",
                "fields": [
                    {"name": "organizerId", "type": "ObjectId -> User", "tags": ["required", "ref"]},
                    {"name": "coordinators[]", "type": "[{ userId, name, email, role }]", "tags": ["ref"]},
                    {"name": "participationType", "type": "individual | group | both", "tags": ["enum"]},
                    {"name": "maxGroupSize", "type": "Number (default: 1)", "tags": []}
                ]
            },
            {
                "title": "Hackathon & Post-Event Operations",
                "fields": [
                    {"name": "isHackathon", "type": "Boolean", "tags": []},
                    {"name": "problemStatements[]", "type": "[{ title, description, maxTeams }]", "tags": []},
                    {"name": "results", "type": "{ isReleased, winners: [{ position, regId }] }", "tags": ["ref"]},
                    {"name": "announcements[]", "type": "[{ message, date, isHidden }]", "tags": []},
                    {"name": "ratings[]", "type": "[{ userId, rating (1-5), review }]", "tags": ["ref"]}
                ]
            }
        ]
    },
    {
        "id": "registration",
        "name": "Registration Model",
        "collection": "registrations",
        "icon": "🎫",
        "color": "#10b981",
        "glow": "rgba(16, 185, 129, 0.35)",
        "badge": "Ticket & Attendance Core",
        "desc": "Manages event passes, team grouping, Razorpay/manual verification, and hackathon project submissions.",
        "sections": [
            {
                "title": "Attendee Reference",
                "fields": [
                    {"name": "userId", "type": "ObjectId -> User", "tags": ["required", "ref"]},
                    {"name": "eventId", "type": "ObjectId -> Event", "tags": ["required", "ref"]},
                    {"name": "Compound Index", "type": "(userId + eventId)", "tags": ["unique", "indexed"]},
                    {"name": "participantName, email, phone", "type": "String, String, String", "tags": ["required"]}
                ]
            },
            {
                "title": "Group & Team Logic",
                "fields": [
                    {"name": "participationType", "type": "individual | group", "tags": ["enum"]},
                    {"name": "teamCode", "type": "String (Unique Team Key)", "tags": ["sparse", "indexed"]},
                    {"name": "isTeamLeader, teamSize", "type": "Boolean, Number", "tags": []},
                    {"name": "joinedTeamCode", "type": "String", "tags": []}
                ]
            },
            {
                "title": "Payment & Hackathon Submissions",
                "fields": [
                    {"name": "status", "type": "registered | waitlisted | attended...", "tags": ["enum"]},
                    {"name": "paymentStatus", "type": "free | pending | verified | paid...", "tags": ["enum"]},
                    {"name": "paymentProof", "type": "String (Screenshot URL)", "tags": []},
                    {"name": "preferences[]", "type": "[ObjectId -> ProblemStatement]", "tags": []},
                    {"name": "projectSubmission", "type": "{ githubLink, liveDemo, slides }", "tags": []}
                ]
            }
        ]
    },
    {
        "id": "query",
        "name": "Query Model",
        "collection": "queries",
        "icon": "💬",
        "color": "#f59e0b",
        "glow": "rgba(245, 158, 11, 0.35)",
        "badge": "Live Event Q&A",
        "desc": "Real-time interactive Q&A channel powered by WebSockets for attendees to communicate with event organizers.",
        "sections": [
            {
                "title": "Event & Asker Context",
                "fields": [
                    {"name": "eventId", "type": "ObjectId -> Event", "tags": ["required", "ref", "indexed"]},
                    {"name": "user.id", "type": "ObjectId -> User", "tags": ["required", "ref"]},
                    {"name": "user.name", "type": "String", "tags": ["required"]}
                ]
            },
            {
                "title": "Question & Resolution",
                "fields": [
                    {"name": "text", "type": "String (Trimmed)", "tags": ["required"]},
                    {"name": "isResolved", "type": "Boolean (default: false)", "tags": []}
                ]
            },
            {
                "title": "Organizer & Attendee Replies",
                "fields": [
                    {"name": "replies[].sender", "type": "attendee | organizer", "tags": ["required", "enum"]},
                    {"name": "replies[].text", "type": "String", "tags": ["required"]},
                    {"name": "replies[].createdAt", "type": "Date (default: Date.now)", "tags": []},
                    {"name": "timestamps", "type": "createdAt, updatedAt", "tags": ["indexed"]}
                ]
            }
        ]
    },
    {
        "id": "schedule",
        "name": "Schedule Model",
        "collection": "schedules",
        "icon": "📅",
        "color": "#0ea5e9",
        "glow": "rgba(14, 165, 233, 0.35)",
        "badge": "Personalized Calendar",
        "desc": "Tracks personalized user itineraries, session conflicts, and automated calendar synchronization.",
        "sections": [
            {
                "title": "User-Event Binding",
                "fields": [
                    {"name": "userId", "type": "ObjectId -> User", "tags": ["required", "ref"]},
                    {"name": "eventId", "type": "ObjectId -> Event", "tags": ["required", "ref"]},
                    {"name": "Compound Index", "type": "(userId + eventId)", "tags": ["unique", "indexed"]}
                ]
            },
            {
                "title": "Timeline & Timeslots",
                "fields": [
                    {"name": "startTime", "type": "Date (ISO timestamp)", "tags": ["required"]},
                    {"name": "endTime", "type": "Date (ISO timestamp)", "tags": ["required"]},
                    {"name": "timestamps", "type": "createdAt, updatedAt", "tags": []}
                ]
            }
        ]
    },
    {
        "id": "notification",
        "name": "Notification Model",
        "collection": "notifications",
        "icon": "🔔",
        "color": "#f43f5e",
        "glow": "rgba(244, 63, 94, 0.35)",
        "badge": "Real-time Push Alerts",
        "desc": "Instant transactional notifications and broadcast alerts delivered via WebSockets and email.",
        "sections": [
            {
                "title": "Recipient & Classification",
                "fields": [
                    {"name": "userId", "type": "ObjectId -> User", "tags": ["required", "ref", "indexed"]},
                    {"name": "type", "type": "info | success | warning", "tags": ["enum", "default: info"]}
                ]
            },
            {
                "title": "Message Payload & State",
                "fields": [
                    {"name": "title", "type": "String", "tags": ["required"]},
                    {"name": "message", "type": "String", "tags": ["required"]},
                    {"name": "isRead", "type": "Boolean (default: false)", "tags": []},
                    {"name": "link", "type": "String (Target Route URL)", "tags": []},
                    {"name": "timestamps", "type": "createdAt, updatedAt", "tags": []}
                ]
            }
        ]
    },
    {
        "id": "log",
        "name": "Log Model",
        "collection": "logs",
        "icon": "📜",
        "color": "#64748b",
        "glow": "rgba(100, 116, 139, 0.35)",
        "badge": "Audit & System Health",
        "desc": "Comprehensive system telemetry, security event logging, and automatic 30-day TTL data retention.",
        "sections": [
            {
                "title": "Log Classification & Severity",
                "fields": [
                    {"name": "level", "type": "info | warning | error", "tags": ["enum", "default: info"]},
                    {"name": "context", "type": "String (Component/Module)", "tags": ["required"]},
                    {"name": "message", "type": "String", "tags": ["required"]}
                ]
            },
            {
                "title": "User Trace & Metadata",
                "fields": [
                    {"name": "userId", "type": "ObjectId -> User (optional)", "tags": ["ref"]},
                    {"name": "url", "type": "String (Request Path)", "tags": []},
                    {"name": "details", "type": "Mixed / JSON Schema", "tags": []}
                ]
            },
            {
                "title": "Storage Optimization",
                "fields": [
                    {"name": "createdAt", "type": "Date (default: Date.now)", "tags": []},
                    {"name": "TTL Index", "type": "expireAfterSeconds: 30 days", "tags": ["indexed"]}
                ]
            }
        ]
    },
    {
        "id": "admin",
        "name": "Admin Model",
        "collection": "admins",
        "icon": "🛡️",
        "color": "#d946ef",
        "glow": "rgba(217, 70, 239, 0.35)",
        "badge": "SuperAdmin & Governance",
        "desc": "Separated administrative entity controlling system policies, user bans, log analysis, and college oversight.",
        "sections": [
            {
                "title": "Administrator Authentication",
                "fields": [
                    {"name": "name", "type": "String", "tags": ["required"]},
                    {"name": "email", "type": "String", "tags": ["required", "unique"]},
                    {"name": "password", "type": "String (bcrypt hash)", "tags": ["required"]}
                ]
            },
            {
                "title": "Privileges & Scope",
                "fields": [
                    {"name": "isSuperAdmin", "type": "Boolean (default: false)", "tags": []},
                    {"name": "permissions[]", "type": "[String] (Granular ACL flags)", "tags": []},
                    {"name": "timestamps", "type": "createdAt, updatedAt", "tags": []}
                ]
            }
        ]
    }
]

def render_model_card_html(m):
    sections_html = ""
    for s in m["sections"]:
        rows_html = ""
        for f in s["fields"]:
            tags_html = "".join([f'<span class="tag tag-{t.split(":")[0]}">{t}</span>' for t in f["tags"]])
            rows_html += f"""
            <div class="field-row">
                <div class="field-name">
                    <span style="color: {m['color']};">●</span> {f['name']}
                </div>
                <div class="field-meta">
                    <span class="field-type">{f['type']}</span>
                    {tags_html}
                </div>
            </div>
            """
        sections_html += f"""
        <div style="margin-top: 10px;">
            <div class="section-title">{s['title']}</div>
            <div style="background: rgba(0,0,0,0.25); border-radius: 12px; border: 1px solid rgba(255,255,255,0.04); overflow: hidden;">
                {rows_html}
            </div>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        {BASE_STYLE}
    </head>
    <body style="padding: 30px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #070a12;">
        <div class="glass-card" style="width: 780px; padding: 28px; --glow-color: {m['glow']}; border-top: 3px solid {m['color']};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="font-size: 38px; background: rgba(255,255,255,0.06); width: 62px; height: 62px; border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1);">
                        {m['icon']}
                    </div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <h1 style="font-size: 26px; font-weight: 700; color: #ffffff;">{m['name']}</h1>
                            <span style="background: rgba(255,255,255,0.08); color: #cbd5e1; font-family: monospace; padding: 2px 8px; border-radius: 6px; font-size: 13px;">collection: {m['collection']}</span>
                        </div>
                        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">{m['desc']}</p>
                    </div>
                </div>
                <span style="background: {m['glow']}; color: {m['color']}; font-weight: 700; font-size: 12px; padding: 6px 12px; border-radius: 20px; border: 1px solid {m['color']};">
                    {m['badge']}
                </span>
            </div>
            {sections_html}
            <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px;">
                <span>Campus EventHub • Database Schema Architecture</span>
                <span>Mongoose ODM • MongoDB Atlas Ready</span>
            </div>
        </div>
    </body>
    </html>
    """

def render_master_collection_html():
    cards_html = ""
    for m in MODELS_DATA:
        preview_fields = []
        for s in m["sections"]:
            for f in s["fields"][:2]:
                preview_fields.append(f)
            if len(preview_fields) >= 4:
                break
        
        fields_snippet = ""
        for f in preview_fields[:4]:
            tag = f["tags"][0] if f["tags"] else "prop"
            fields_snippet += f"""
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
                <span style="color: #e2e8f0; font-weight: 500;">{f['name']}</span>
                <span class="tag tag-{tag.split(':')[0]}" style="font-size: 9px; padding: 2px 5px;">{tag}</span>
            </div>
            """

        cards_html += f"""
        <div class="glass-card" style="padding: 18px; border-top: 3px solid {m['color']}; --glow-color: {m['glow']};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">{m['icon']}</span>
                    <h3 style="font-size: 16px; font-weight: 700; color: #fff;">{m['name']}</h3>
                </div>
                <span style="font-size: 10px; color: {m['color']}; font-weight: 600; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">
                    {m['collection']}
                </span>
            </div>
            <p style="font-size: 11px; color: #94a3b8; height: 32px; overflow: hidden; margin-bottom: 10px; line-height: 1.4;">
                {m['desc']}
            </p>
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px 10px;">
                {fields_snippet}
            </div>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        {BASE_STYLE}
    </head>
    <body style="padding: 40px; background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #090d16 65%); min-height: 100vh;">
        <div style="max-width: 1400px; margin: 0 auto;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 35px;">
                <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); padding: 6px 16px; border-radius: 20px; color: #a5b4fc; font-size: 13px; font-weight: 600; margin-bottom: 14px;">
                    ⚡ Full System Architecture & Data Schema
                </div>
                <h1 style="font-size: 38px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    Campus EventHub — Master Models Architecture
                </h1>
                <p style="font-size: 16px; color: #94a3b8; max-width: 780px; margin: 10px auto 0 auto; line-height: 1.6;">
                    Comprehensive Mongoose Entity-Relationship structure powering dynamic RBAC, automated QR attendance, real-time live Q&A, and multi-tenant college events.
                </p>
            </div>

            <!-- Architecture Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 35px;">
                {cards_html}
            </div>

            <!-- Architecture Relationships Footer Box -->
            <div class="glass-card" style="padding: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; background: rgba(15, 23, 42, 0.9);">
                <div>
                    <h4 style="color: #60a5fa; font-size: 14px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        🔗 Relational Integrity & Indexes
                    </h4>
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                        Compound unique index on <code>(userId + eventId)</code> enforces 1 registration and 1 schedule per student. Sparse index on <code>teamCode</code> allows team grouping.
                    </p>
                </div>
                <div>
                    <h4 style="color: #34d399; font-size: 14px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        🛡️ Dynamic RBAC Contexts
                    </h4>
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                        Context-driven permissions calculated dynamically via <code>organizerId === user._id</code> and <code>Registration</code> presence, eliminating brittle hardcoded roles.
                    </p>
                </div>
                <div>
                    <h4 style="color: #f472b6; font-size: 14px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        ⚡ High-Performance Realtime
                    </h4>
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
                        Socket.IO bi-directional pipes for queries and notifications; Node-Cron 24-hr reminder scheduler, and automated 30-day TTL log pruning.
                    </p>
                </div>
            </div>

            <div style="margin-top: 25px; text-align: center; font-size: 13px; color: #64748b;">
                Designed & Engineered by <strong style="color: #e2e8f0;">Sumit Patel</strong> • Full Stack MERN Architecture • Production Ready
            </div>
        </div>
    </body>
    </html>
    """

def render_linkedin_showcase_html():
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        {BASE_STYLE}
    </head>
    <body style="width: 1200px; height: 628px; overflow: hidden; background: radial-gradient(ellipse at top left, #1e1b4b 0%, #0c1222 50%, #06080e 100%); padding: 40px; display: flex; flex-direction: column; justify-content: space-between;">
        
        <!-- Top Nav / Header -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #3b82f6); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);">
                    🎪
                </div>
                <div>
                    <h2 style="font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">Campus EventHub</h2>
                    <p style="font-size: 12px; color: #94a3b8;">Next-Gen Full Stack Campus Fest & Conference Ecosystem</p>
                </div>
            </div>

            <div style="display: flex; gap: 8px;">
                <span style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #c7d2fe; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px;">
                    React 19 + Vite
                </span>
                <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #a7f3d0; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px;">
                    Node.js + Express
                </span>
                <span style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); color: #bfdbfe; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px;">
                    MongoDB Atlas
                </span>
                <span style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fde68a; font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px;">
                    Socket.IO
                </span>
            </div>
        </div>

        <!-- Hero Center -->
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 30px; align-items: center; margin: 15px 0;">
            <div>
                <span style="color: #60a5fa; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                    🚀 Production-Grade System Architecture
                </span>
                <h1 style="font-size: 34px; font-weight: 800; color: #fff; line-height: 1.25; margin: 8px 0 14px 0;">
                    Scalable Event Orchestration with AI Identity & Real-Time Q&A
                </h1>
                <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 18px;">
                    Engineered to replace disjointed Google Forms and fragmented workflows. Features dynamic contextual RBAC, automated QR check-in passes, hackathon problem tracking, and background reminders.
                </p>

                <div style="display: flex; gap: 14px;">
                    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 16px;">
                        <div style="font-size: 20px; font-weight: 800; color: #38bdf8;">8 Models</div>
                        <div style="font-size: 11px; color: #94a3b8;">Normalized Schemas</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 16px;">
                        <div style="font-size: 20px; font-weight: 800; color: #34d399;">Real-Time</div>
                        <div style="font-size: 11px; color: #94a3b8;">WebSockets Engine</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 16px;">
                        <div style="font-size: 20px; font-weight: 800; color: #f472b6;">AI-Verified</div>
                        <div style="font-size: 11px; color: #94a3b8;">ID & Live Photo OCR</div>
                    </div>
                </div>
            </div>

            <!-- Mini Visual Cards of Models -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div class="glass-card" style="padding: 12px; border-left: 3px solid #6366f1;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                        <span>👤</span> <strong style="font-size: 13px; color: #fff;">User & Capabilities</strong>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8;">Dynamic participant / organizer roles with AI OCR verification</div>
                </div>

                <div class="glass-card" style="padding: 12px; border-left: 3px solid #8b5cf6;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                        <span>🎪</span> <strong style="font-size: 13px; color: #fff;">Event & Hackathon</strong>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8;">Wizard creator, problem statements, announcements & reviews</div>
                </div>

                <div class="glass-card" style="padding: 12px; border-left: 3px solid #10b981;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                        <span>🎫</span> <strong style="font-size: 13px; color: #fff;">Pass & Registration</strong>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8;">QR ticket generation, team codes, and payment verification</div>
                </div>

                <div class="glass-card" style="padding: 12px; border-left: 3px solid #f59e0b;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                        <span>💬</span> <strong style="font-size: 13px; color: #fff;">Live Q&A & Sockets</strong>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8;">Bi-directional real-time attendee queries & organizer replies</div>
                </div>
            </div>
        </div>

        <!-- Footer Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; color: #fff;">
                    SP
                </div>
                <div>
                    <span style="font-size: 13px; font-weight: 700; color: #fff;">Sumit Patel</span>
                    <span style="font-size: 11px; color: #94a3b8; margin-left: 6px;">Full Stack Software Developer</span>
                </div>
            </div>

            <div style="font-size: 12px; color: #94a3b8;">
                GitHub: <span style="color: #60a5fa; font-weight: 600;">CampusEventHub</span> • Open Source Innovation
            </div>
        </div>

    </body>
    </html>
    """

def render_github_banner_html():
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        {BASE_STYLE}
    </head>
    <body style="width: 1280px; height: 420px; overflow: hidden; background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%); padding: 45px; display: flex; flex-direction: column; justify-content: space-between; border-bottom: 3px solid #6366f1;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 18px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1, #3b82f6); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 34px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);">
                    🎪
                </div>
                <div>
                    <h1 style="font-size: 40px; font-weight: 900; color: #ffffff; letter-spacing: -1px;">Campus EventHub</h1>
                    <p style="font-size: 16px; color: #94a3b8; font-weight: 500;">Next-Gen MERN Event Management & Hackathon Operating System</p>
                </div>
            </div>

            <div style="display: flex; gap: 10px;">
                <span style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #86efac; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px;">
                    ● System Active v1.0
                </span>
                <span style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #c7d2fe; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px;">
                    ⭐ Living Docs Verified
                </span>
            </div>
        </div>

        <!-- Badges / Highlights -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0;">
            <div class="glass-card" style="padding: 16px; border-top: 2px solid #6366f1;">
                <div style="font-size: 18px; margin-bottom: 4px;">👥 Dynamic RBAC</div>
                <div style="font-size: 12px; color: #94a3b8;">Contextual permissions for organizers & participants</div>
            </div>
            <div class="glass-card" style="padding: 16px; border-top: 2px solid #10b981;">
                <div style="font-size: 18px; margin-bottom: 4px;">📱 QR Attendance</div>
                <div style="font-size: 12px; color: #94a3b8;">Anti-duplicate camera scanner & PDF ticket pass</div>
            </div>
            <div class="glass-card" style="padding: 16px; border-top: 2px solid #f59e0b;">
                <div style="font-size: 18px; margin-bottom: 4px;">⚡ Live Q&A Stream</div>
                <div style="font-size: 12px; color: #94a3b8;">Socket.IO real-time audience queries & organizer replies</div>
            </div>
            <div class="glass-card" style="padding: 16px; border-top: 2px solid #ec4899;">
                <div style="font-size: 18px; margin-bottom: 4px;">💻 Hackathon Suite</div>
                <div style="font-size: 12px; color: #94a3b8;">Problem track selection, group codes & demo links</div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px;">
            <div>Node.js • Express • React 19 • MongoDB • Socket.IO • Tailwind CSS • FastAPI NLP</div>
            <div>Author: <strong style="color: #cbd5e1;">Sumit Patel</strong></div>
        </div>
    </body>
    </html>
    """

async def main():
    print("🚀 Initializing Playwright browser to generate visuals and screenshots...")
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # 1. Generate Individual Model Cards (8 models)
        print("📸 Generating 8 Model Cards...")
        for m in MODELS_DATA:
            page = await browser.new_page(viewport={"width": 900, "height": 950}, device_scale_factor=2)
            html = render_model_card_html(m)
            await page.set_content(html)
            out_path = os.path.join(MODELS_IMG_DIR, f"model_{m['id']}.png")
            await page.screenshot(path=out_path, full_page=True)
            await page.close()
            print(f"  ✓ Saved: {out_path}")

        # 2. Generate Master Collection Infographic
        print("📸 Generating Master Models Collection Infographic...")
        page = await browser.new_page(viewport={"width": 1440, "height": 1180}, device_scale_factor=2)
        html = render_master_collection_html()
        await page.set_content(html)
        out_collection = os.path.join(DOCS_IMG_DIR, "campus-eventhub-models-collection.png")
        await page.screenshot(path=out_collection, full_page=True)
        await page.close()
        print(f"  ✓ Saved: {out_collection}")

        # 3. Generate LinkedIn Showcase Banner
        print("📸 Generating LinkedIn Showcase Graphic (1200x628)...")
        page = await browser.new_page(viewport={"width": 1200, "height": 628}, device_scale_factor=2)
        html = render_linkedin_showcase_html()
        await page.set_content(html)
        out_linkedin = os.path.join(DOCS_IMG_DIR, "campus-eventhub-linkedin-showcase.png")
        await page.screenshot(path=out_linkedin)
        await page.close()
        print(f"  ✓ Saved: {out_linkedin}")

        # 4. Generate GitHub Hero Banner
        print("📸 Generating GitHub README Banner (1280x420)...")
        page = await browser.new_page(viewport={"width": 1280, "height": 420}, device_scale_factor=2)
        html = render_github_banner_html()
        await page.set_content(html)
        out_github = os.path.join(DOCS_IMG_DIR, "campus-eventhub-github-banner.png")
        await page.screenshot(path=out_github)
        await page.close()
        print(f"  ✓ Saved: {out_github}")

        # 5. Capture Live Application Pages from http://localhost:5173
        print("📸 Capturing Live Application Screenshots from running dev server...")
        live_pages = [
            {"route": "/", "filename": "live_home.png", "width": 1440, "height": 900},
            {"route": "/features", "filename": "live_features.png", "width": 1440, "height": 900},
            {"route": "/pricing", "filename": "live_pricing.png", "width": 1440, "height": 900},
            {"route": "/login", "filename": "live_login.png", "width": 1440, "height": 900},
            {"route": "/register", "filename": "live_register.png", "width": 1440, "height": 900},
            {"route": "/about", "filename": "live_about.png", "width": 1440, "height": 900},
        ]

        for lp in live_pages:
            try:
                page = await browser.new_page(viewport={"width": lp["width"], "height": lp["height"]}, device_scale_factor=1.5)
                url = f"http://localhost:5173{lp['route']}"
                print(f"  Navigating to {url}...")
                await page.goto(url, wait_until="networkidle", timeout=12000)
                await page.wait_for_timeout(1500)
                shot_path = os.path.join(SCREENSHOTS_DIR, lp["filename"])
                await page.screenshot(path=shot_path)
                await page.close()
                print(f"  ✓ Live Screenshot saved: {shot_path}")
            except Exception as e:
                print(f"  ⚠️ Could not capture {lp['route']}: {e}")

        await browser.close()

    # Copy files to frontend/public/showcase/ for public accessibility
    for root, dirs, files in os.walk(DOCS_IMG_DIR):
        for f in files:
            if f.endswith(".png"):
                src = os.path.join(root, f)
                dst = os.path.join(FRONTEND_SHOWCASE_DIR, f)
                shutil.copy2(src, dst)
    print("✨ All images generated and mirrored to frontend/public/showcase/!")

if __name__ == "__main__":
    asyncio.run(main())
