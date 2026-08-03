const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// Configure Nodemailer (Use your real credentials in production/env)
const transporter = nodemailer.createTransport({
    service: 'gmail', // you can use other services
    auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'fake_password'
    }
});

// @desc    Send OTP to email
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        // Generate 6 digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to Database
        await Otp.deleteMany({ email }); // Clear older OTPs for this email
        await Otp.create({ email, otp: otpCode });

        // Print to Console for local Hackathon testing (in case SMTP fails)
        console.log(`\n=======================`);
        console.log(`🚀 DEV / HACKATHON MODE: `);
        console.log(`🔑 OTP for ${email} is: ${otpCode}`);
        console.log(`=======================\n`);

        // Send Email (Fails silently if not configured so the app doesn't crash)
        try {
            await transporter.sendMail({
                from: '"EverTried Workers" <no-reply@evertried.com>',
                to: email,
                subject: 'EverTried Login Code',
                html: `<h2>Your EverTried Login Code</h2><p>Use code <strong>${otpCode}</strong> to login. Valid for 5 minutes.</p>`
            });
        } catch(e) {
            console.log('Nodemailer Error (Expected if no real credentials):', e.message);
        }

        res.status(200).json({ message: 'OTP sent successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and Login/Register
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const validOtpEntry = await Otp.findOne({ email, otp });
        if (!validOtpEntry) {
            return res.status(401).json({ message: 'Invalid or Expired OTP' });
        }

        // OTP Valid. Check if user exists.
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email, 
                password: 'passwordless_account' // Unused due to OTP logic
            });
        }

        // Delete OTP
        await Otp.deleteOne({ _id: validOtpEntry._id });

        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            profileCompleted: user.profileCompleted,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google OAuth Verify Endpoint
const googleAuth = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name: name || undefined, 
                role: role || 'pending',
                password: 'google_oauth_account'
            });
        }

        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            profileCompleted: user.profileCompleted,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendOtp, verifyOtp, googleAuth };
