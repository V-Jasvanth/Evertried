import { createContext, useState } from 'react';
import axios from 'axios';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error('Invalid stored user data:', error);
            localStorage.removeItem('user');
            return null;
        }
    });

    const API_URL = (
        import.meta.env.VITE_API_URL || 'http://localhost:5000'
    ).replace(/\/$/, '');

    // Get authorization headers for protected APIs
    const getAuthConfig = () => {
        if (!user?.token) {
            throw new Error('Authentication required. Please login again.');
        }

        return {
            headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        };
    };

    // -----------------------------
    // AUTHENTICATION
    // -----------------------------

    // Send OTP
    const sendOtp = async (email) => {
        const { data } = await axios.post(
            `${API_URL}/api/auth/send-otp`,
            { email }
        );

        return data;
    };

    // Verify OTP and login/register
    const verifyOtp = async (email, otp, name, role) => {
        const { data } = await axios.post(
            `${API_URL}/api/auth/verify-otp`,
            {
                email,
                otp,
                name,
                role
            }
        );

        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);

        return data;
    };

    // Google authentication
    const googleAuthLogin = async (name, email, role) => {
        const { data } = await axios.post(
            `${API_URL}/api/auth/google`,
            {
                name,
                email,
                role
            }
        );

        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);

        return data;
    };

    // -----------------------------
    // USER PROFILE
    // -----------------------------

    // Get current user profile
    const getProfile = async () => {
        const config = getAuthConfig();

        const { data } = await axios.get(
            `${API_URL}/api/user/profile`,
            config
        );

        return data;
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        const config = getAuthConfig();

        const { data } = await axios.put(
            `${API_URL}/api/user/profile`,
            profileData,
            config
        );

        const updatedUser = {
            ...user,
            ...data
        };

        localStorage.setItem(
            'user',
            JSON.stringify(updatedUser)
        );

        setUser(updatedUser);

        return updatedUser;
    };

    // -----------------------------
    // WORKER SKILLS
    // -----------------------------

    const updateSkills = async (skills) => {
        const config = getAuthConfig();

        const { data } = await axios.post(
            `${API_URL}/api/user/update-skills`,
            {
                userId: user._id,
                skills
            },
            config
        );

        return data;
    };

    // -----------------------------
    // JOB / RATING
    // -----------------------------

    const completeJob = async (workerId, rating) => {
        const config = getAuthConfig();

        const { data } = await axios.post(
            `${API_URL}/api/user/complete-job`,
            {
                workerId,
                rating
            },
            config
        );

        return data;
    };

    // -----------------------------
    // DIGITAL SIGNATURE
    // -----------------------------

    const createSignature = async (fullName) => {
        const config = getAuthConfig();

        const { data } = await axios.post(
            `${API_URL}/api/user/create-signature`,
            {
                fullName
            },
            config
        );

        return data;
    };

    const getSignature = async () => {
        const config = getAuthConfig();

        const { data } = await axios.get(
            `${API_URL}/api/user/get-signature`,
            config
        );

        return data;
    };

    // -----------------------------
    // LOGOUT
    // -----------------------------

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                sendOtp,
                verifyOtp,
                googleAuthLogin,
                getProfile,
                updateProfile,
                updateSkills,
                completeJob,
                createSignature,
                getSignature,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};