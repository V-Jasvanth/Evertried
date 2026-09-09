const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

// --------------------------------------------------
// JWT TOKEN
// --------------------------------------------------

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is missing');
    }

    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// --------------------------------------------------
// RESEND EMAIL CONFIGURATION
// --------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY);

// --------------------------------------------------
// SEND OTP
// --------------------------------------------------

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        // Check Resend API key
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY is missing');

            return res.status(500).json({
                message: 'Email service is not configured'
            });
        }

        // --------------------------------------------------
        // GENERATE 6-DIGIT OTP
        // --------------------------------------------------

        const otpCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // --------------------------------------------------
        // REMOVE PREVIOUS OTPs
        // --------------------------------------------------

        await Otp.deleteMany({ email });

        // --------------------------------------------------
        // SAVE NEW OTP
        // --------------------------------------------------

        await Otp.create({
            email,
            otp: otpCode
        });

        console.log('\n==============================');
        console.log('OTP GENERATED');
        console.log(`Email: ${email}`);
        console.log(`OTP: ${otpCode}`);
        console.log('==============================\n');

        // --------------------------------------------------
        // SEND EMAIL USING RESEND
        // --------------------------------------------------

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'EverTried <onboarding@resend.dev>',
            to: [email],
            subject: 'EverTried Login OTP',
            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 30px;
                    background: #ffffff;
                    color: #111827;
                ">

                    <h2 style="
                        margin-bottom: 20px;
                        color: #111827;
                    ">
                        EverTried Login Code
                    </h2>

                    <p>
                        Your OTP for signing in to EverTried is:
                    </p>

                    <div style="
                        font-size: 36px;
                        font-weight: bold;
                        letter-spacing: 10px;
                        margin: 25px 0;
                        padding: 20px;
                        background: #f3f4f6;
                        border-radius: 10px;
                        text-align: center;
                    ">
                        ${otpCode}
                    </div>

                    <p>
                        This OTP is valid for <strong>5 minutes</strong>.
                    </p>

                    <p style="color: #6b7280;">
                        If you did not request this code,
                        you can safely ignore this email.
                    </p>

                    <p>
                        Regards,<br>
                        <strong>EverTried Team</strong>
                    </p>

                </div>
            `
        });

        // --------------------------------------------------
        // HANDLE RESEND ERROR
        // --------------------------------------------------

        if (error) {
            console.error('\n==============================');
            console.error('RESEND EMAIL FAILED');
            console.error(error);
            console.error('==============================\n');

            return res.status(500).json({
                message: 'Failed to send OTP email',
                error: error.message || 'Resend email error'
            });
        }

        console.log('\n==============================');
        console.log('EMAIL SENT SUCCESSFULLY');
        console.log(`Email: ${email}`);
        console.log(`Resend ID: ${data?.id || 'N/A'}`);
        console.log('==============================\n');

        return res.status(200).json({
            message: 'OTP sent successfully!'
        });

    } catch (error) {
        console.error('\n==============================');
        console.error('EMAIL SENDING FAILED');
        console.error(error);
        console.error('==============================\n');

        return res.status(500).json({
            message: 'Failed to send OTP email',
            error: error.message
        });
    }
};

// --------------------------------------------------
// VERIFY OTP
// --------------------------------------------------

const verifyOtp = async (req, res) => {
    try {
        const { email, otp, name, role } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            });
        }

        // --------------------------------------------------
        // FIND VALID OTP
        // --------------------------------------------------

        const validOtpEntry = await Otp.findOne({
            email,
            otp
        });

        if (!validOtpEntry) {
            return res.status(401).json({
                message: 'Invalid or Expired OTP'
            });
        }

        // --------------------------------------------------
        // FIND EXISTING USER
        // --------------------------------------------------

        let user = await User.findOne({ email });

        // --------------------------------------------------
        // CREATE NEW USER IF NEEDED
        // --------------------------------------------------

        if (!user) {
            user = await User.create({
                email,
                name: name || undefined,
                role: role || 'pending',
                password: 'passwordless_account'
            });
        }

        // --------------------------------------------------
        // UPDATE MISSING INFORMATION
        // --------------------------------------------------

        else {
            let changed = false;

            if (name && !user.name) {
                user.name = name;
                changed = true;
            }

            if (role && (!user.role || user.role === 'pending')) {
                user.role = role;
                changed = true;
            }

            if (changed) {
                await user.save();
            }
        }

        // --------------------------------------------------
        // DELETE USED OTP
        // --------------------------------------------------

        await Otp.deleteOne({
            _id: validOtpEntry._id
        });

        // --------------------------------------------------
        // RETURN USER + JWT
        // --------------------------------------------------

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileCompleted: user.profileCompleted,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('OTP verification error:', error);

        return res.status(500).json({
            message: error.message
        });
    }
};

// --------------------------------------------------
// GOOGLE AUTH
// --------------------------------------------------

const googleAuth = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        // --------------------------------------------------
        // FIND EXISTING USER
        // --------------------------------------------------

        let user = await User.findOne({ email });

        // --------------------------------------------------
        // CREATE USER IF NEEDED
        // --------------------------------------------------

        if (!user) {
            user = await User.create({
                email,
                name: name || undefined,
                role: role || 'pending',
                password: 'google_oauth_account'
            });
        }

        // --------------------------------------------------
        // RETURN USER + JWT
        // --------------------------------------------------

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileCompleted: user.profileCompleted,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Google authentication error:', error);

        return res.status(500).json({
            message: error.message
        });
    }
};

// --------------------------------------------------
// EXPORT
// --------------------------------------------------

module.exports = {
    sendOtp,
    verifyOtp,
    googleAuth
};