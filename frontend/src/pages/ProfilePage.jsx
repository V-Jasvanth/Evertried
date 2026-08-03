import { useState, useContext, useEffect } from 'react';
import { User, Mail, ShieldCheck, Star, Briefcase, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import DigitalSignature from '../components/DigitalSignature';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_URL}/api/user/profile`, config);
                setProfileData(data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, API_URL]);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-brand-DEFAULT">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-DEFAULT rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 w-full flex flex-col md:flex-row gap-8">
            
            {/* Left Column: General Info */}
            <div className="flex-1 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5"><User className="w-32 h-32" /></div>
                    
                    <div className="flex items-center gap-6 mb-8 relative z-10">
                        <div className="w-24 h-24 bg-brand-light text-brand-dark rounded-full flex justify-center items-center text-4xl font-black shadow-inner border border-brand-DEFAULT/20">
                            {(profileData?.name || user?.name)?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">{profileData?.name || user?.name || 'Worker Name'}</h1>
                            <span className="inline-flex items-center gap-1.5 bg-brand-DEFAULT text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> {profileData?.role || user?.role}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm"><Mail className="w-5 h-5"/></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registered Email</p>
                                <p className="text-slate-800 font-medium">{profileData?.email || user?.email || 'No email securely attached'}</p>
                            </div>
                        </div>

                        {profileData?.role === 'worker' && (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-yellow-500 shadow-sm"><Star className="w-5 h-5 fill-current"/></div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Rating</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-slate-800 font-medium">{profileData?.rating || 0}/5.0</p>
                                        <span className="text-xs text-slate-500 font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
                                            {profileData?.ratingCount || 0} Reviews
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {profileData?.role === 'employer' && (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm"><Briefcase className="w-5 h-5"/></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Structure</p>
                                    <p className="text-slate-800 font-medium">{profileData?.employerType || 'Standard Employer'}</p>
                                </div>
                            </div>
                        )}
                        
                        {(profileData?.primarySkill || (profileData?.skills && profileData.skills.length > 0)) && (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-DEFAULT shadow-sm"><Settings className="w-5 h-5"/></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Skills Profile</p>
                                    <p className="text-slate-800 font-medium font-bold">
                                         {profileData?.primarySkill} {profileData?.skills?.length ? `+ ${profileData.skills.length} verified manual skills` : ''}
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Right Column: Signature / Trust Assets */}
            <div className="flex-1 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">Legal Identity Verification</h2>
                    <DigitalSignature />
                </div>
                
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700 shadow-lg text-white">
                    <h3 className="text-lg font-bold mb-2">EverTried Trust Guarantee</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Your digital signature is permanently bonded to your Account ID. It acts as a legally binding handshake between workers and employers across the EverTried network, preventing fraud and guaranteeing verified labor.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-brand-DEFAULT/20 text-brand-light px-4 py-2 rounded-xl text-xs font-bold border border-brand-DEFAULT/30">
                        <ShieldCheck className="w-4 h-4" /> Blockchain-grade Hashing Enabled
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProfilePage;
