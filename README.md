# Campus EventHub

Campus EventHub is a modern, scalable event management platform built on the MERN stack. It is designed to handle college fests, seminars, and club activities with features like Role-Based Access Control, QR code attendance, automated email tickets, live Q&A, and PDF ticket generation.

## Documentation
This project relies on living documentation. Please refer to the following files for in-depth information:
- [Requirements](requirements.md)
- [Technical Architecture](architecture.md)

## Project Structure
- `/frontend`: React application built with Vite and Tailwind CSS.
- `/backend`: Node.js/Express REST API, Socket.IO WebSockets, Nodemailer, and Node-Cron jobs.

## Setup Instructions

### Backend
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file and add your MongoDB URI and JWT Secret.
4. Start the server: `npm start` (or `node server.js`)

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the Vite dev server: `npm run dev`

## UI/UX Guidelines
The UI is strictly designed using the [ui-ux-pro-max-skill](../ui-ux-pro-max-skill) toolkit. AI developers contributing to this project should use the toolkit's CLI search to pull color palettes, typography, and layout guidelines before building new components.
