const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '30d' }
    );
};

// --------------------------------------------------
// GMAIL SMTP CONFIGURATION
// --------------------------------------------------

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('EMAIL_USER or EMAIL_PASS is missing in .env');

            return res.status(500).json({
                message: 'Email service is not configured'
            });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Remove previous OTPs
        await Otp.deleteMany({ email });

        // Save new OTP
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
        // SEND EMAIL
        // --------------------------------------------------

        await transporter.sendMail({
            from: `"EverTried" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'EverTried Login OTP',
            text: `Your EverTried login OTP is ${otpCode}. This OTP is valid for 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>EverTried Login Code</h2>

                    <p>Your OTP for signing in to EverTried is:</p>

                    <div style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        margin: 20px 0;
                    ">
                        ${otpCode}
                    </div>

                    <p>This OTP is valid for 5 minutes.</p>

                    <p>
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

        console.log(`Email sent successfully to ${email}`);

        return res.status(200).json({
            message: 'OTP sent successfully!'
        });

    } catch (error) {
        console.error('\n==============================');
        console.error('EMAIL SENDING FAILED');
        console.error(error.message);
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

        const validOtpEntry = await Otp.findOne({
            email,
            otp
        });

        if (!validOtpEntry) {
            return res.status(401).json({
                message: 'Invalid or Expired OTP'
            });
        }

        // Find existing user
        let user = await User.findOne({ email });

        // Create new user if needed
        if (!user) {
            user = await User.create({
                email,
                name: name || undefined,
                role: role || 'pending',
                password: 'passwordless_account'
            });
        } else {
            // Update missing information if supplied
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

        // Delete used OTP
        await Otp.deleteOne({
            _id: validOtpEntry._id
        });

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

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name: name || undefined,
                role: role || 'pending',
                password: 'google_oauth_account'
            });
        }

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