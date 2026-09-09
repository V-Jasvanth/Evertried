# EverTried

### AI-Powered Hyperlocal Skilled Worker Matching Platform

EverTried is a hyperlocal workforce platform designed to connect skilled workers with nearby employers based on skills, experience, availability, and location.

The platform aims to simplify local hiring by helping employers discover suitable workers while enabling workers to discover relevant job opportunities nearby.

---

## Live Demo

[Visit EverTried](https://evertried.onrender.com)

---

## Overview

Finding reliable skilled workers quickly can be difficult for local employers, while skilled workers often struggle to discover suitable opportunities near them.

EverTried addresses this problem through a unified platform where:

- Workers can create professional skill profiles.
- Employers can create profiles and post job opportunities.
- Workers can discover nearby job opportunities.
- Employers can discover suitable workers.
- AI assists with worker skill and experience profiling.
- Real-time updates improve the job discovery and hiring workflow.

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
- Employer dashboard

### Platform Features

- Hyperlocal workforce matching
- AI-assisted worker profiling
- Real-time job updates
- Real-time communication using Socket.IO
- Worker assignment tracking
- Digital signatures
- Contract viewing
- MongoDB Atlas integration
- Email services
- Protected dashboard workflows
- Responsive web interface
- Environment-based configuration
- Production deployment

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

- Manage their profile
- View skills and experience
- Discover jobs
- Apply for opportunities
- Track applications
- View assignments

### Employer Dashboard

Employers can:

- Manage their profile
- Post jobs
- Define job requirements
- Discover workers
- Review applications
- Manage hiring workflows

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
| Email | Nodemailer |
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
             |                  MongoDB       AI / Email
             |                   Atlas         Services
             |                      |
             +----------------------+ 
                                    |
                           Intelligent Matching
                                    |
                         +----------+----------+
                         |                     |
                      Workers              Employers
Project Structure
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
Production Deployment

EverTried is deployed using Render.

Frontend

The React + Vite application is deployed as the production web application.

Backend

The Node.js + Express backend is deployed as a web service.

Database

MongoDB Atlas is used as the production database.

Authentication

Firebase Authentication provides Google Sign-In and passwordless authentication functionality.

Current Status

The core EverTried platform is operational.

Completed
Worker authentication
Employer authentication
Email OTP login
Google Sign-In
Firebase authentication configuration
MongoDB Atlas connection
Backend APIs
Worker dashboard
Employer dashboard
Coordinator dashboard
Job posting workflow
Job application workflow
Worker assignment workflow
AI voice profiling
Gemini skill extraction
Socket.IO integration
Digital signature component
Contract viewer
Protected routes
Production build verification
Production deployment
Recent Development
September 2026
Improved Google authentication workflow.
Configured Firebase authorized domains for production.
Verified Google Sign-In in the deployed environment.
Verified authentication persistence after page refresh.
Improved worker AI voice profiling.
Improved Gemini skill extraction and validation.
Continued improvements to worker and employer workflows.
Future Improvements

Potential future improvements include:

More advanced worker-job recommendation algorithms
Improved geographic matching
Enhanced AI-powered job recommendations
Worker availability scheduling
Advanced employer analytics
Notification system improvements
Mobile application support
License

This project is developed as an academic and portfolio project.

Author

Jasvanth

GitHub: V-Jasvanth