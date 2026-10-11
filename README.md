# EverTried

### AI-Powered Hyperlocal Skilled Worker Matching Platform

EverTried is a hyperlocal workforce platform designed to connect skilled workers with nearby employers based on skills, experience, availability, and location.

The platform aims to simplify local hiring by helping employers discover suitable workers while enabling workers to discover relevant job opportunities nearby.

---

## Live Demo

[Visit EverTried](https://evertried-1.onrender.com)

---

## Overview

Finding reliable skilled workers quickly can be difficult for local employers, while skilled workers often struggle to discover suitable opportunities near them.

EverTried addresses this problem through a unified platform where:

- Workers can create professional skill profiles.
- Employers can create profiles and post job opportunities.
- Workers can discover nearby job opportunities.
- Employers can discover suitable workers.
- AI assists with worker skill and experience profiling.
- Real-time updates and persistent notifications improve the job discovery and hiring workflow.

---

## Key Features

### Worker Features

- Worker registration and authentication
- Passwordless email OTP authentication
- Google authentication
- Professional worker profile
- Manual skill selection
- Experience management
- AI-powered voice profiling
- AI-based skill extraction
- Skill portfolio management
- Hyperlocal job discovery
- Real-time job feed
- Job application workflow
- Dedicated "My Applications" tracking view
- Multi-state application lifecycle tracking (Applied, Accepted/Hired, Rejected, In Progress, Completed)
- Interactive job details modal viewer
- Direct digital contract access for hired positions
- Worker dashboard
- Profile management

### Employer Features

- Employer registration and authentication
- Google authentication
- Employer profile management
- Job posting
- Job requirement management
- Worker discovery
- Worker-job matching
- Job application management
- Rich applicant cards with worker skills, experience, ratings, and wage expectations
- Interactive applicant review (Accept/Hire and Reject actions with live feedback states)
- Real-time applicant updates and automated contract generation
- Contract viewing for hired workers
- Employer dashboard

### Platform Features

- Hyperlocal workforce matching
- AI-assisted worker profiling
- Real-time job updates
- Real-time communication using Socket.IO
- Real-time persistent notification system
- User-specific notification delivery
- Notification unread count badge and read/unread status management
- Offline notification persistence
- Job lifecycle notifications (JOB_CREATED, JOB_APPLICATION, APPLICATION_ACCEPTED, APPLICATION_REJECTED, JOB_STARTED, JOB_COMPLETED)
- Reusable `JobDetailModal` component for comprehensive job inspection
- Protected job details retrieval (`GET /api/jobs/:id`)
- Real-time dashboard state refresh on Socket.IO notification and application events
- Live slot progress tracking (`X / Y slots filled`)
- Worker assignment tracking
- Digital signatures
- Contract viewing
- MongoDB Atlas integration
- Email services (Resend)
- Protected dashboard workflows
- Responsive web interface
- Environment-based configuration
- Production deployment

---

## Notification System

EverTried includes a production-grade real-time persistent notification system connecting workers and employers across all key job lifecycle events.

### Capabilities

- Persistent MongoDB notification storage
- Real-time Socket.IO user room notification delivery (`user:<userId>`)
- User-specific notification targeting and strict isolation
- Unread notification count badge in navigation header
- Mark single notification as read
- Mark all notifications as read
- Offline notification persistence (retrieved upon user login)
- Job lifecycle notification events:
  - `JOB_CREATED`: Sent to matched workers when a relevant job is created
  - `JOB_APPLICATION`: Sent to employer when a worker applies
  - `APPLICATION_ACCEPTED`: Sent to worker when employer hires them
  - `APPLICATION_REJECTED`: Sent to worker when application is not selected
  - `JOB_STARTED`: Sent to worker when contract is created/started
  - `JOB_COMPLETED`: Sent to worker when job is marked completed

---

## AI Voice Profiling

EverTried includes an AI-powered voice profiling workflow designed to extract relevant worker skills and experience from spoken input.

The system processes worker voice input and assists in generating structured skill information for the worker profile.

### AI Capabilities

- Voice-based worker profiling
- Skill extraction
- Experience extraction
- Skill validation
- Gemini-powered AI processing

---

## Authentication

EverTried uses Firebase Authentication together with backend authentication services.

### Supported Authentication

- Email OTP authentication
- Google Sign-In
- JWT-based backend authentication

The application also uses authorized domains and environment-based configuration for production authentication.

---

## Dashboards

EverTried provides dedicated workflows for different platform users.

### Worker Dashboard

Workers can:

- Manage their profile, skills, and experience
- Discover nearby job opportunities in real time
- Apply for jobs with instant confirmation
- Track submitted applications with clear lifecycle statuses (Applied, Accepted/Hired, Rejected, In Progress, Completed)
- Inspect full job specifications in a dedicated modal overlay
- Access and review legal digital contracts when hired
- Receive real-time persistent notifications

### Employer Dashboard

Employers can:

- Manage their profile and post live jobs
- Define job requirements, worker capacity, and pay rates
- Monitor slot filling progress in real time
- Inspect rich applicant profiles with skills, experience, ratings, and wage expectations
- Accept/Hire or Reject applicants with instant UI feedback and action processing states
- Access and review generated digital contracts for hired workers
- Receive applicant notifications in real time

### Coordinator Dashboard

Coordinators can:

- Monitor worker assignments
- Track hiring workflows
- Manage worker-job coordination

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Language | JavaScript |
| Backend | Node.js |
| Server Framework | Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | Firebase |
| Backend Authentication | JWT |
| AI | Google Gemini |
| Email | Resend |
| Real-time Communication | Socket.IO |
| Styling | Tailwind CSS |
| Deployment | Render |
| Version Control | Git & GitHub |

---

## Project Architecture

```text
                         EverTried
                            |
             +--------------+--------------+
             |                             |
      React Frontend                 Node.js Backend
             |                             |
     +-------+-------+             +-------+-------+
     |               |             |               |
 Worker UI       Employer UI     REST APIs      Services
     |               |             |               |
     +-------+-------+             +-------+-------+
             |                             |
             |                      +------+------+
             |                      |             |
             |                  MongoDB       AI / Email / Notifications
             |                   Atlas         Services
             |                      |
             +----------------------+ 
                                    |
                           Intelligent Matching
                                    |
                         +----------+----------+
                         |                     |
                      Workers              Employers
```

### Project Structure

```text
EverTried/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## Production Deployment

EverTried is deployed using Render.

### Frontend

The React + Vite application is deployed as the production web application at `https://evertried-1.onrender.com`.

### Backend

The Node.js + Express backend is deployed as a web service at `https://evertried.onrender.com`.

### Database

MongoDB Atlas is used as the production database.

### Authentication

Firebase Authentication provides Google Sign-In and passwordless authentication functionality.

---

## Current Status

The core EverTried platform is operational.

### Completed

- Worker authentication
- Employer authentication
- Email OTP login
- Google Sign-In
- Firebase authentication configuration
- MongoDB Atlas connection
- Backend APIs
- Worker dashboard
- Employer dashboard
- Coordinator dashboard
- Job posting workflow
- Job application workflow
- Dedicated worker application tracking tab
- Multi-state application lifecycle tracking (Applied, Accepted/Hired, Rejected, In Progress, Completed)
- Rich employer applicant cards (worker skills, experience, ratings, wage expectations)
- Employer Accept/Hire and Reject action controls with loading/disabled states
- Digital contract access for hired workers
- Reusable `JobDetailModal` component
- Protected single job endpoint (`GET /api/jobs/:id`)
- Real-time dashboard data refresh on Socket.IO notification/application events
- Worker assignment workflow
- AI voice profiling
- Gemini skill extraction
- Socket.IO integration
- Real-time persistent notification system
- User-specific notification delivery
- Notification read/unread management
- Offline notification persistence
- Job lifecycle notification integration
- Digital signature component
- Contract viewer
- Protected routes
- Production build verification
- Production deployment

### Recent Development

#### October 2026

- Added a dedicated **My Applications** tab on the Worker Dashboard with multi-state tracking (`Applied`, `Accepted & Hired`, `Rejected`, `In Progress`, `Completed`).
- Enhanced Employer Dashboard applicant cards to display worker skills, experience history, primary skill, ratings, and wage expectations.
- Added Accept/Hire and Reject applicant management actions with loading, disabled, and feedback states.
- Integrated digital contract access for hired workers directly from worker and employer dashboards.
- Created reusable `JobDetailModal.jsx` component for inspecting full job specifications (pay, slot fill progress, required skills, location, employer details, and application status).
- Added protected `GET /api/jobs/:id` endpoint for secure job specification retrieval.
- Connected Socket.IO events (`worker_applied`, `job_confirmation`, `notification:new`) to automatically refresh dashboard states in real time when application statuses change.
- Verified end-to-end job workflow through automated smoke testing (job creation, application, employer review, hiring, contract generation, and notification persistence).

#### September 2026

- Implemented real-time persistent notifications with MongoDB storage and Socket.IO user room delivery.
- Integrated notifications with job lifecycle events (`JOB_CREATED`, `JOB_APPLICATION`, `APPLICATION_ACCEPTED`, `APPLICATION_REJECTED`, `JOB_STARTED`, `JOB_COMPLETED`).
- Added notification read/unread controls and unread count badge.
- Verified notification system through automated end-to-end smoke tests.
- Improved Google authentication workflow and configured Firebase authorized domains for production.
- Verified Google Sign-In and authentication persistence across page refreshes in the deployed environment.
- Improved worker AI voice profiling with Gemini skill extraction and validation.
- Continued improvements to worker and employer workflows.

---

## Verification

- Frontend ESLint: Passed
- Frontend production build: Passed
- Backend syntax check: Passed
- Automated notification smoke tests: Passed
- Automated job workflow smoke test: Passed (job creation, application, employer review, hiring, contract access, and notification persistence)
- Notification API & persistence tests: Passed
- Socket.IO delivery & room isolation tests: Passed
- Authorization & data isolation tests: Passed
- Offline notification persistence tests: Passed
- Job lifecycle notification tests: Passed
- Frontend notification verification: Passed

---

## Future Improvements

Potential future improvements include:

- More advanced worker-job recommendation algorithms
- Improved geographic matching
- Enhanced AI-powered job recommendations
- Worker availability scheduling
- Advanced employer analytics
- Mobile application support

---

## License

This project is developed as an academic and portfolio project.

## Author

Jasvanth

GitHub: V-Jasvanth