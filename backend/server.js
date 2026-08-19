// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load Schema Models globally prior to socket executions
const Job = require('./models/Job');
const User = require('./models/User');

// Route imports
// IMPORTANT: These come AFTER dotenv.config()
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const geminiRoutes = require('./routes/geminiRoutes');


// Connect to database
connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});


// Middleware
app.use(express.json());
app.use(cors());


// Pass IO to requests
app.set('io', io);


// Global Socket Configuration
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    // Register worker or employer
    socket.on('register', (userId) => {
        connectedUsers.set(userId, socket.id);

        console.log(
            `Registered user ${userId} with socket ${socket.id}`
        );
    });


    // Worker applies for job
    socket.on('job_apply', async (data) => {
        try {
            const job = await Job.findById(data.jobId);

            if (!job) return;

            // Prevent duplicate applications
            const alreadyApplied = job.applicants.some(
                (a) => a.worker.toString() === data.workerId
            );

            if (alreadyApplied) {
                console.log(
                    `Worker ${data.workerId} already applied to job ${data.jobId}`
                );

                return;
            }

            // Check available slots
            if (job.filledSlots >= job.workerCount) {
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
                .select('name rating skills location');

            const employerSocket =
                connectedUsers.get(data.employerId);

            // Notify employer
            if (employerSocket && worker) {
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
            console.error('Apply error:', error);
        }
    });


    // Employer selects worker
    socket.on('job_select', async (data) => {
        try {

            await Job.updateOne(
                {
                    _id: data.jobId,
                    'applicants.worker': data.workerId
                },
                {
                    $set: {
                        'applicants.$.status': data.status
                    }
                }
            );

            // Recalculate filled slots
            const activeJobObj =
                await Job.findById(data.jobId);

            if (activeJobObj) {

                const filledSlots =
                    activeJobObj.applicants.filter(
                        (a) => a.status === 'hired'
                    ).length;

                activeJobObj.filledSlots = filledSlots;


                // Update job status
                if (
                    filledSlots >=
                    activeJobObj.workerCount
                ) {
                    activeJobObj.status = 'in-progress';

                } else if (filledSlots > 0) {
                    activeJobObj.status = 'partially-filled';

                } else {
                    activeJobObj.status = 'open';
                }


                await activeJobObj.save();
            }


            // Notify worker
            const workerSocket =
                connectedUsers.get(data.workerId);

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


    // Disconnect
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


app.set(
    'connectedUsers',
    connectedUsers
);


// Routes
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


// Health check
app.get('/api/health', (req, res) => {

    res.json({
        message: 'EverTried Engine is running!'
    });

});


// Port
const PORT =
    process.env.PORT || 5000;


// Start server
server.listen(PORT, () => {

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
});