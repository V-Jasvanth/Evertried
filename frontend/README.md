# EverTried

### AI-Powered Hyperlocal Skilled Worker Matching Platform

EverTried is a hyperlocal workforce platform designed to connect skilled workers with nearby employers based on skills, experience, availability, and location.

The platform helps reduce the gap between local employers and skilled workers by providing intelligent matching, real-time job discovery, and streamlined worker and employer profiles.

---

## Live Demo

**[Visit EverTried](https://evertried.onrender.com)**

---

## Overview

Finding reliable skilled workers quickly can be difficult for local employers, while skilled workers often struggle to discover suitable opportunities near them.

EverTried addresses this problem by providing a digital platform where:

- Employers can post job requirements.
- Workers can create professional skill profiles.
- Workers can discover nearby job opportunities.
- Employers can find suitable workers.
- The platform can match workers and jobs based on relevant criteria.
- Real-time job feeds help workers discover new opportunities.

---

## Key Features

### Worker Features

- Worker registration and authentication
- Professional profile creation
- Manual skill selection
- Experience management
- AI-powered voice profiling
- Skill portfolio management
- Hyperlocal job discovery
- Real-time job feed
- Worker dashboard
- Profile management

### Employer Features

- Employer registration and authentication
- Employer profile management
- Job posting
- Job requirement management
- Worker discovery
- Intelligent worker-job matching
- Employer dashboard

### Platform Features

- Hyperlocal search
- Real-time job feed
- Intelligent matching
- AI-assisted worker profiling
- MongoDB database integration
- Email functionality
- Responsive web interface
- Secure environment-based configuration

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Programming Language | JavaScript |
| Backend | Node.js |
| Server Framework | Express.js |
| Database | MongoDB Atlas |
| Authentication | Firebase |
| Deployment | Render |
| Version Control | Git & GitHub |

---

## Project Architecture

```text
                         EverTried
                            |
              +-------------+-------------+
              |                           |
        React Frontend              Node.js Backend
              |                           |
       +------+-------+           +-------+-------+
       |              |           |               |
   Worker UI      Employer UI   REST APIs      Services
                                      |
                              +-------+-------+
                              |               |
                           MongoDB         Email /
                            Atlas          Auth Services
                              |
                       Intelligent Matching
                              |
                    +---------+---------+
                    |                   |
                 Workers            Employers
                 ---

## Project Structure

```text
EverTried/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
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