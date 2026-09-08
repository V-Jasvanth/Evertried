// ============================================================
// EverTried Backend Server
// ============================================================

// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

// DNS configuration
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

// ============================================================
// Models
// ============================================================

const Job = require('./models/Job');
const User = require('./models/User');

// ============================================================
// Routes
// ============================================================

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

// ============================================================
// Database Connection
// ============================================================

connectDB();

// ============================================================
// Express App
// ============================================================

const app = express();

const server = http.createServer(app);

// ============================================================
// Socket.IO
// ============================================================

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// ============================================================
// Middleware
// ============================================================

app.use(express.json());

app.use(cors());

// Pass Socket.IO to requests
app.set('io', io);

// ============================================================
// Connected Users
// ============================================================

const connectedUsers = new Map();

app.set('connectedUsers', connectedUsers);

// ============================================================
// Socket.IO Configuration
// ============================================================

io.on('connection', (socket) => {

    console.log(`User connected to socket: ${socket.id}`);

    // --------------------------------------------------------
    // Register Worker / Employer
    // --------------------------------------------------------

    socket.on('register', (userId) => {

        if (!userId) {
            return;
        }

        connectedUsers.set(
            userId.toString(),
            socket.id
        );

        console.log(
            `Registered user ${userId} with socket ${socket.id}`
        );
    });

    // --------------------------------------------------------
    // Worker Applies For Job
    // --------------------------------------------------------

    socket.on('job_apply', async (data) => {

        try {

            if (!data || !data.jobId || !data.workerId) {
                return;
            }

            const job = await Job.findById(data.jobId);

            if (!job) {
                console.log(
                    `Job ${data.jobId} not found`
                );

                return;
            }

            // Prevent duplicate applications
            const alreadyApplied = job.applicants.some(
                (a) =>
                    a.worker &&
                    a.worker.toString() ===
                    data.workerId.toString()
            );

            if (alreadyApplied) {

                console.log(
                    `Worker ${data.workerId} already applied to job ${data.jobId}`
                );

                return;
            }

            // Check available slots
            if (
                job.filledSlots >=
                job.workerCount
            ) {

                console.log(
                    `Job ${data.jobId} is full (${job.filledSlots}/${job.workerCount})`
                );

                return;
            }

            // Add applicant
            await Job.findByIdAndUpdate(
                data.jobId,
                {
                    $push: {
                        applicants: {
                            worker: data.workerId,
                            status: 'applied'
                        }
                    }
                }
            );

            // Get worker information
            const worker = await User
                .findById(data.workerId)
                .select(
                    'name rating skills location'
                );

            if (!worker) {
                console.log(
                    `Worker ${data.workerId} not found`
                );

                return;
            }

            // Find employer socket
            const employerSocket =
                connectedUsers.get(
                    data.employerId?.toString()
                );

            // Notify employer
            if (employerSocket) {

                io.to(employerSocket).emit(
                    'worker_applied',
                    {
                        jobId: data.jobId,
                        workerId: worker._id,
                        name: worker.name,
                        rating: worker.rating,
                        distance: '1.2 km',
                        skills: worker.skills
                    }
                );

            }

        } catch (error) {

            console.error(
                'Apply error:',
                error
            );

        }

    });

    // --------------------------------------------------------
    // Employer Selects Worker
    // --------------------------------------------------------

    socket.on('job_select', async (data) => {

        try {

            if (
                !data ||
                !data.jobId ||
                !data.workerId
            ) {
                return;
            }

            await Job.updateOne(
                {
                    _id: data.jobId,
                    'applicants.worker': data.workerId
                },
                {
                    $set: {
                        'applicants.$.status':
                            data.status
                    }
                }
            );

            // Get updated job
            const activeJobObj =
                await Job.findById(
                    data.jobId
                );

            if (activeJobObj) {

                // Recalculate filled slots
                const filledSlots =
                    activeJobObj.applicants.filter(
                        (a) =>
                            a.status === 'hired'
                    ).length;

                activeJobObj.filledSlots =
                    filledSlots;

                // Update job status
                if (
                    filledSlots >=
                    activeJobObj.workerCount
                ) {

                    activeJobObj.status =
                        'in-progress';

                } else if (
                    filledSlots > 0
                ) {

                    activeJobObj.status =
                        'partially-filled';

                } else {

                    activeJobObj.status =
                        'open';

                }

                await activeJobObj.save();
            }

            // Notify worker
            const workerSocket =
                connectedUsers.get(
                    data.workerId.toString()
                );

            if (workerSocket) {

                io.to(workerSocket).emit(
                    'job_confirmation',
                    data
                );

            }

        } catch (error) {

            console.error(
                'Job select error:',
                error
            );

        }

    });

    // --------------------------------------------------------
    // Disconnect
    // --------------------------------------------------------

    socket.on('disconnect', () => {

        connectedUsers.forEach(
            (value, key) => {

                if (value === socket.id) {

                    connectedUsers.delete(key);

                    console.log(
                        `User ${key} disconnected`
                    );

                }

            }
        );

    });

});

// ============================================================
// API Routes
// ============================================================

app.use(
    '/api/auth',
    authRoutes
);

app.use(
    '/api/user',
    userRoutes
);

app.use(
    '/api/jobs',
    jobRoutes
);

app.use(
    '/api/gemini',
    geminiRoutes
);

app.use(
    '/api/contract',
    require('./routes/contractRoutes')
);

app.use(
    '/api/dashboard',
    require('./routes/dashboardRoutes')
);

// ============================================================
// Health Check
// ============================================================

app.get(
    '/api/health',
    (req, res) => {

        res.json({
            success: true,
            message:
                'EverTried Engine is running!'
        });

    }
);

// ============================================================
// Serve Frontend
// ============================================================

// frontend/dist is one level above backend
const frontendPath = path.join(
    __dirname,
    '..',
    'frontend',
    'dist'
);

const frontendIndex = path.join(
    frontendPath,
    'index.html'
);

// Check whether frontend build exists
if (fs.existsSync(frontendIndex)) {

    console.log(
        `Frontend found at: ${frontendPath}`
    );

    // Serve frontend static files
    app.use(
        express.static(frontendPath)
    );

} else {

    console.warn(
        `WARNING: Frontend build not found at ${frontendIndex}`
    );

}

// ============================================================
// React/Vite SPA Fallback
// ============================================================

// This allows routes such as:
//
// /
// /login
// /register
// /dashboard
// /profile
//
// to load the React application.

app.use((req, res, next) => {

    // Only handle browser HTML requests
    if (
        req.method !== 'GET' ||
        !req.headers.accept ||
        !req.headers.accept.includes('text/html')
    ) {
        return next();
    }

    // Never interfere with API routes
    if (
        req.path.startsWith('/api/')
    ) {
        return next();
    }

    // Make sure frontend exists
    if (!fs.existsSync(frontendIndex)) {

        return res.status(404).json({
            success: false,
            message:
                'Frontend build not found on server.'
        });

    }

    res.sendFile(frontendIndex);

});

// ============================================================
// 404 Handler
// ============================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: 'Route not found'
    });

});

// ============================================================
// Error Handler
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(
            'Server error:',
            err
        );

        res.status(
            err.status || 500
        ).json({
            success: false,
            message:
                err.message ||
                'Internal server error'
        });

    }
);

// ============================================================
// Port
// ============================================================

const PORT =
    process.env.PORT || 5000;

// ============================================================
// Start Server
// ============================================================

server.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Email configured: ${
                process.env.EMAIL_USER
                    ? 'YES'
                    : 'NO'
            }`
        );

        console.log(
            `Email password configured: ${
                process.env.EMAIL_PASS
                    ? 'YES'
                    : 'NO'
            }`
        );

        console.log(
            `Frontend path: ${frontendPath}`
        );

    }
);