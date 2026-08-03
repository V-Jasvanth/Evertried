import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Briefcase, HardHat, Users, Hash } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Verification
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('worker');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { sendOtp, verifyOtp, googleAuthLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await sendOtp(email);
            setStep(2); // Move to OTP entry
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await verifyOtp(email, otp, isLogin ? undefined : name, role);
            if (data.role === 'worker') navigate('/worker');
            else if (data.role === 'coordinator') navigate('/'); 
            else navigate('/employer');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        }
        setLoading(false);
    };

    const handleFirebaseGoogleLogin = async () => {
        if (!auth) {
            return setError('Firebase config not set up in frontend/src/firebase.js yet.');
        }
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const { displayName, email: googleEmail } = result.user;

            const data = await googleAuthLogin(displayName, googleEmail, role);
            if (data.role === 'worker') navigate('/worker');
            else navigate('/employer');
            
        } catch (err) {
            console.error(err);
            setError('Google login was unsuccessful');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 py-16">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-brand-DEFAULT rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-DEFAULT/30 mb-4 transform hover:-translate-y-1 transition-transform">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {step === 1 ? (isLogin ? 'Welcome Back' : 'Create Account') : 'Verify Email'}
                        </h2>
                        <p className="text-slate-500 mt-1">
                            {step === 1 ? 'Sign in using passwordless link & Google' : `Enter the 6-digit code sent to ${email}`}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <>
                            <form onSubmit={handleSendOTP} className="space-y-5">
                                {!isLogin && (
                                    <div className="animate-in fade-in duration-300">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input 
                                                type="text" required
                                                className="w-full pl-10 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-DEFAULT focus:ring-4 focus:ring-brand-DEFAULT/10 transition-all bg-white"
                                                value={name} onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                )}

                                {!isLogin && (
                                    <div className="animate-in fade-in duration-300 delay-75">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">I am a...</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <label className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl border cursor-pointer transition-all ${role === 'worker' ? 'bg-brand-light border-brand-DEFAULT text-brand-dark font-bold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                                <input type="radio" value="worker" checked={role === 'worker'} onChange={() => setRole('worker')} className="hidden" />
                                                <HardHat className="w-4 h-4" /> <span className="text-xs sm:text-sm">Worker</span>
                                            </label>
                                            <label className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl border cursor-pointer transition-all ${role === 'employer' ? 'bg-brand-light border-brand-DEFAULT text-brand-dark font-bold shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                                <input type="radio" value="employer" checked={role === 'employer'} onChange={() => setRole('employer')} className="hidden" />
                                                <Briefcase className="w-4 h-4" /> <span className="text-xs sm:text-sm">Employer</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input 
                                            type="email" required
                                            className="w-full pl-10 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-DEFAULT focus:ring-4 focus:ring-brand-DEFAULT/10 transition-all bg-white"
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] mt-4 disabled:opacity-50">
                                    {loading ? 'Processing...' : 'Send OTP'}
                                </button>
                            </form>

                            <div className="my-6 flex items-center gap-3">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-xs font-semibold text-slate-400 tracking-wider">OR</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <button onClick={handleFirebaseGoogleLogin} className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl py-3.5 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-3">
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">6-Digit Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Hash className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input 
                                        type="text" required maxLength="6"
                                        className="w-full pl-10 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-DEFAULT focus:ring-4 focus:ring-brand-DEFAULT/10 transition-all bg-white font-bold tracking-widest text-center"
                                        value={otp} onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-brand-DEFAULT text-white rounded-xl py-3.5 font-bold hover:bg-brand-dark transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                                {loading ? 'Verifying...' : 'Verify & Sign In'}
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="w-full text-slate-500 text-sm font-semibold hover:text-slate-800 transition-colors">
                                Edit Email
                            </button>
                        </form>
                    )}

                    {step === 1 && (
                        <p className="mt-8 text-center text-sm text-slate-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-brand-DEFAULT hover:text-brand-dark transition-colors border-none bg-transparent cursor-pointer p-0 underline-offset-4 hover:underline">
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
