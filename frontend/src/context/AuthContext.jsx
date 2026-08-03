import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const sendOtp = async (email) => {
        await axios.post(`${API_URL}/api/auth/send-otp`, { email });
    };

    const verifyOtp = async (email, otp, name, role) => {
        const { data } = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp, name, role });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const googleAuthLogin = async (name, email, role) => {
        const { data } = await axios.post(`${API_URL}/api/auth/google`, { name, email, role });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const updateProfile = async (profileData) => {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.put(`${API_URL}/api/user/profile`, profileData, config);
        const updatedUser = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return updatedUser;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, sendOtp, verifyOtp, googleAuthLogin, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
