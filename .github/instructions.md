# 📘 Instructions for Skill Handling

## Overview
This document defines how skills are created, stored, updated, and used in the EverTried system.

The skill system is the **core of the matching engine**, enabling accurate job-worker pairing using structured data and intelligent filtering.

---

# 🧱 Tech Stack Used

## Backend
- Node.js + Express.js
- MongoDB (Mongoose ODM)

## Frontend
- React.js

## External Services
- Google Maps API (location distance calculation)
- Firebase (notifications)

---

# 🗄️ Database Design (MongoDB)

## Users Collection
```json
{
  "_id": "userId",
  "name": "Ravi",
  "role": "worker",
  "skills": [
    {
      "name": "plumber",
      "experience": 3,
      "rating": 4.5
    }
  ],
  "location": {
    "lat": 17.385,
    "lng": 78.4867
  },
  "availability": true
}
```

## Jobs Collection
```json
{
  "_id": "jobId",
  "title": "Fix water pipe",
  "requiredSkills": ["plumber"],
  "workerCount": 2,
  "location": {
    "lat": 17.39,
    "lng": 78.48
  },
  "status": "open"
}
```

---

# 🧾 Worker Side Implementation

### 1. Skill Selection (Frontend - React)
- Multi-select dropdown (skills list)
- Input for experience (years)

```javascript
const [skills, setSkills] = useState([]);

const handleSkillAdd = (skill) => {
  setSkills([...skills, skill]);
};
```

### 2. API Call (Backend)
`POST /api/user/update-skills`

```javascript
router.post('/update-skills', async (req, res) => {
  const { userId, skills } = req.body;

  await User.findByIdAndUpdate(userId, { skills });

  res.json({ message: "Skills updated" });
});
```

---

# 🧾 Employer Side Implementation

### Job Creation API
`POST /api/jobs/create`

```javascript
router.post('/create', async (req, res) => {
  const job = new Job(req.body);
  await job.save();
  res.json(job);
});
```

**Required Fields:**
- `requiredSkills` (array)
- `workerCount`
- `location`

---

# ⚙️ Matching Engine (Core Logic)

### Basic Matching Algorithm
```javascript
function matchWorkers(job, workers) {
  return workers.filter(worker => {
    const skillMatch = job.requiredSkills.some(skill =>
      worker.skills.map(s => s.name).includes(skill)
    );

    const isAvailable = worker.availability === true;

    const distance = getDistance(worker.location, job.location);
    const isNearby = distance <= 5; // km

    return skillMatch && isAvailable && isNearby;
  });
}
```

### 📍 Distance Calculation (Haversine Formula)
```javascript
function getDistance(loc1, loc2) {
  const R = 6371; // km
  const dLat = (loc2.lat - loc1.lat) * Math.PI/180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI/180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI/180) *
    Math.cos(loc2.lat * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

---

# 🔄 Update Rules (Backend Logic)

### After Job Completion
```javascript
router.post('/complete-job', async (req, res) => {
  const { workerId, rating } = req.body;

  const worker = await User.findById(workerId);

  // Update average rating
  worker.rating = (worker.rating + rating) / 2;

  await worker.save();

  res.json({ message: "Job completed & rating updated" });
});
```

---

# 🧠 Smart Enhancements (Advanced Logic)

### 1. Ranking Workers
```javascript
function rankWorkers(workers) {
  return workers.sort((a, b) => {
    return (
      b.rating * 0.5 +
      b.skills.length * 0.3 +
      (b.experience || 0) * 0.2
    ) - (
      a.rating * 0.5 +
      a.skills.length * 0.3 +
      (a.experience || 0) * 0.2
    );
  });
}
```

### 2. Skill Suggestion System
Based on:
- Past jobs
- High-demand skills

**Example:**
```javascript
// pseudo logic
if (worker.completedJobs.includes("electrician")) {
  suggest("advanced electrician");
}
```

### 3. High-Demand Skills Tracking
Count job frequency per skill and store in analytics collection:
```json
{
  "skill": "plumber",
  "demandCount": 120
}
```

---

# 🔐 Validation Rules
- Skills must be from predefined list
- Experience must be ≥ 0
- Max 10 skills per worker

---

# 🚀 Performance Optimizations

**Index skills field in MongoDB:**
```javascript
userSchema.index({ "skills.name": 1 });
```

**Use geo-indexing for location:**
```javascript
userSchema.index({ location: "2dsphere" });
```