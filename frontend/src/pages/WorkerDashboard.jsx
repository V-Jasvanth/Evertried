import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle,
    MapPin,
    Award,
    Search,
    TrendingUp,
    BellRing,
    Navigation,
    Mic,
    Mic2,
    Sparkles,
    AlertCircle,
    Eye,
    Clock,
    FileText,
    XCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import DigitalSignature from '../components/DigitalSignature';
import ContractViewer from '../components/ContractViewer';
import JobDetailModal from '../components/JobDetailModal';

const WorkerDashboard = () => {
    const { user, updateSkills } = useContext(AuthContext);

    // Skills are now loaded from MongoDB
    const [skills, setSkills] = useState([]);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillExp, setNewSkillExp] = useState('');

    const [whatsappEnabled, setWhatsappEnabled] = useState(true);

    // Gemini AI Voice Setup
    const [isListeningAI, setIsListeningAI] = useState(false);
    const [aiMessage, setAiMessage] = useState('');
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'opportunities'
    const [selectedJobDetailId, setSelectedJobDetailId] = useState(null);
    const [selectedDetailAppStatus, setSelectedDetailAppStatus] = useState(null);

    // Socket connection is kept in a ref instead of state
    const socketRef = useRef(null);

    const [dashboardData, setDashboardData] = useState({
        earningsPotential: 4200,
        user: {},
        myApplications: []
    });

    const [activeContractId, setActiveContractId] = useState(null);

    const API_URL = (
        import.meta.env.VITE_API_URL || 'http://localhost:5000'
    ).replace(/\/$/, '');

    // Persist skills to MongoDB and update state
    const saveAndSetSkills = async (updatedSkills) => {
        setSkills(updatedSkills);
        if (updateSkills) {
            try {
                await updateSkills(updatedSkills);
            } catch (err) {
                console.error('Failed to persist skills to backend:', err);
            }
        }
    };

    // -----------------------------
    // DASHBOARD + SOCKET CONNECTION
    // -----------------------------

    const fetchDash = useCallback(async () => {
        if (!user?.token) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const res = await axios.get(
                `${API_URL}/api/dashboard/worker`,
                config
            );

            setDashboardData(res.data);

            if (res.data.user?.skills) {
                setSkills(res.data.user.skills);
            }

            if (res.data.nearbyJobs) {
                setJobs((prevJobs) => {
                    if (prevJobs.length > 0) {
                        return prevJobs;
                    }
                    return res.data.nearbyJobs.map((j) => ({
                        ...j,
                        id: j._id
                    }));
                });
            }
        } catch (err) {
            console.error('Error fetching worker dashboard:', err);
        }
    }, [user, API_URL]);

    useEffect(() => {
        if (!user?.token) return;

        const initialFetch = setTimeout(() => {
            fetchDash();
        }, 0);

        const newSocket = io(API_URL);
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            newSocket.emit('register', user._id);
        });

        // Listen for new jobs broadcasted by employers
        newSocket.on('new_job', (job) => {
            setJobs((prev) => [job, ...prev]);
        });

        // Listen for job confirmation
        newSocket.on('job_confirmation', (data) => {
            if (data.status === 'hired') {
                setJobs((prev) =>
                    prev.map((job) =>
                        job.id === data.jobId
                            ? { ...job, status: 'Hired!' }
                            : job
                    )
                );
            }
            fetchDash();
        });

        // Real-time listener for persistent notification updates
        newSocket.on('notification:new', (notif) => {
            if (['APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'JOB_STARTED', 'JOB_COMPLETED'].includes(notif.type)) {
                fetchDash();
            }
        });

        return () => {
            clearTimeout(initialFetch);
            newSocket.close();
            socketRef.current = null;
        };
    }, [user, API_URL, fetchDash]);

    // -----------------------------
    // GEMINI VOICE PROFILE
    // -----------------------------

    const handleGeminiVoiceProfile = async () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert(
                'Your browser does not support Voice Recognition. Please try Google Chrome.'
            );
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListeningAI(true);
        setAiMessage('Listening... Speak your skills!');

        recognition.start();

        recognition.onresult = async (event) => {
            const transcript =
                event.results[0][0].transcript;

            setAiMessage(`Heard: "${transcript}"`);

            setTimeout(async () => {
                try {
                    setAiMessage('AI processing... Please wait.');

                   const response = await axios.post(
    `${API_URL}/api/gemini/extract-skills`,
    { transcript },
    {
        headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        }
    }
);

                    const extractedSkills = response.data.skills;

                    if (
                        Array.isArray(extractedSkills) &&
                        extractedSkills.length > 0
                    ) {
                        const existingNames = new Set(skills.map(s => s.name.toLowerCase()));
                        const uniqueExtracted = extractedSkills.filter(s => !existingNames.has(s.name.toLowerCase()));

                        if (uniqueExtracted.length > 0) {
                            const combined = [...skills, ...uniqueExtracted].slice(0, 10);
                            await saveAndSetSkills(combined);
                            setAiMessage(
                                `Success! Saved ${uniqueExtracted.length} new skill(s) to portfolio.`
                            );
                        } else {
                            setAiMessage(
                                'Extracted skill(s) already present in portfolio.'
                            );
                        }
                    } else {
                        setAiMessage(
                            'Could not detect specific skills. Try again!'
                        );
                    }

                    setTimeout(() => {
                        setIsListeningAI(false);
                        setAiMessage('');
                    }, 3500);
                } catch (err) {
                    console.error('Backend Error:', err);

                    const errMsg = err.response?.data?.message || 'Error processing transcript.';
                    setAiMessage(errMsg);

                    setTimeout(() => {
                        setIsListeningAI(false);
                        setAiMessage('');
                    }, 3500);
                }
            }, 1000);
        };

        recognition.onerror = (event) => {
            setAiMessage(
                `Microphone Error: ${event.error}`
            );

            setTimeout(() => {
                setIsListeningAI(false);
                setAiMessage('');
            }, 3000);
        };

        recognition.onspeechend = () => {
            recognition.stop();
        };
    };

    // -----------------------------
    // SKILLS
    // -----------------------------

    const handleAddSkill = async (e) => {
        e.preventDefault();

        if (skills.length >= 10) {
            return alert('Maximum 10 skills allowed');
        }

        const trimmedName = newSkillName.trim();
        if (!trimmedName || !newSkillExp) {
            return;
        }

        if (skills.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert('This skill is already in your portfolio');
            return;
        }

        const updated = [
            ...skills,
            {
                name: trimmedName,
                experience: Number(newSkillExp)
            }
        ];

        setNewSkillName('');
        setNewSkillExp('');
        await saveAndSetSkills(updated);
    };

    const removeSkill = async (indexToRemove) => {
        const updated = skills.filter(
            (_, idx) => idx !== indexToRemove
        );
        await saveAndSetSkills(updated);
    };

    // -----------------------------
    // JOB APPLICATION
    // -----------------------------

    const handleApply = (jobId, employerId) => {
        // Optimistic UI update
        setJobs(
            jobs.map((job) =>
                job.id === jobId
                    ? { ...job, actionState: 'applied' }
                    : job
            )
        );

        // Use the Socket.IO ref
        if (socketRef.current) {
            socketRef.current.emit('job_apply', {
                jobId,
                workerId: user._id,
                employerId,
                name: user.name,
                rating: user.rating,
                distance: '1.2 km',
                skills
            });
        }
    };

    const handleDecline = (id) => {
        setJobs(
            jobs.filter((job) => job.id !== id)
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Worker Dashboard
                    </h1>

                    <p className="text-slate-500 mt-1">
                        Manage your skills, rating, and receive live instant jobs.
                    </p>
                </div>

                {/* Hackathon Output: WhatsApp Integration */}
                <div
                    role="button"
                    onClick={() =>
                        setWhatsappEnabled(!whatsappEnabled)
                    }
                    className={`flex items-center gap-3 px-4 py-2 border rounded-xl cursor-pointer transition-all ${
                        whatsappEnabled
                            ? 'bg-green-50 border-green-200 shadow-sm'
                            : 'bg-white border-slate-200'
                    }`}
                >
                    <div
                        className={`p-2 rounded-full ${
                            whatsappEnabled
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        <BellRing className="w-4 h-4" />
                    </div>

                    <div>
                        <p
                            className={`text-sm font-bold ${
                                whatsappEnabled
                                    ? 'text-green-800'
                                    : 'text-slate-600'
                            }`}
                        >
                            Live Job Feed
                        </p>

                        <p
                            className={`text-[10px] uppercase font-bold tracking-wider ${
                                whatsappEnabled
                                    ? 'text-green-600'
                                    : 'text-slate-400'
                            }`}
                        >
                            {whatsappEnabled
                                ? 'Connected'
                                : 'Disconnected'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Intelligence Panels */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Skills Component */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">

                        {/* Hackathon: Gemini Voice to Profile AI */}
                        <div className="bg-gradient-to-r from-indigo-50 to-brand-light border-b border-indigo-100 p-5">
                            <div className="flex justify-between items-center mb-3">

                                <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-brand-DEFAULT" />
                                    AI Voice Profiling
                                </h3>

                                <button
                                    type="button"
                                    onClick={handleGeminiVoiceProfile}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all shadow-md cursor-pointer ${
                                        isListeningAI
                                            ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                                            : 'bg-brand-DEFAULT text-white border border-brand-dark hover:bg-brand-dark hover:scale-105'
                                    }`}
                                >
                                    {isListeningAI ? (
                                        <>
                                            <Mic className="w-3 h-3 animate-bounce" />
                                            Recording
                                        </>
                                    ) : (
                                        <>
                                            <Mic2 className="w-4 h-4" />
                                            Speak Profile
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-[13px] text-indigo-700 leading-relaxed font-medium">
                                Don't know how to type your skills? Just speak! Our Gemini AI engine will transcribe your voice and automatically extract your skills to build your professional portfolio.
                            </p>

                            {aiMessage && (
                                <div className="mt-4 text-xs font-bold text-brand-dark bg-white/70 p-3 rounded-lg flex items-center gap-3 border border-brand-DEFAULT/10 shadow-sm animate-in fade-in">
                                    <div className="w-4 h-4 border-2 border-brand-DEFAULT border-t-transparent rounded-full animate-spin"></div>
                                    {aiMessage}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                            <h2 className="font-semibold text-sm flex items-center gap-2 text-slate-700">
                                <Award className="w-4 h-4 text-slate-400" />
                                Manual Override
                            </h2>
                        </div>

                        <div className="p-6 flex-1">

                            {/* Manual Skill Addition Box */}
                            <form
                                onSubmit={handleAddSkill}
                                className="space-y-4 mb-6"
                            >
                                <div>
                                    <select
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-DEFAULT focus:ring-2 focus:ring-brand-DEFAULT/20 transition-all bg-slate-50 text-sm"
                                        value={newSkillName}
                                        onChange={(e) =>
                                            setNewSkillName(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            Choose Skill...
                                        </option>
                                        <option value="Plumber">
                                            Plumber
                                        </option>
                                        <option value="Electrician">
                                            Electrician
                                        </option>
                                        <option value="Carpenter">
                                            Carpenter
                                        </option>
                                        <option value="Painter">
                                            Painter
                                        </option>
                                        <option value="Mason">
                                            Mason
                                        </option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        placeholder="Exp (Years)"
                                        min="0"
                                        required
                                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-DEFAULT focus:ring-2 bg-slate-50 text-sm"
                                        value={newSkillExp}
                                        onChange={(e) =>
                                            setNewSkillExp(e.target.value)
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="bg-slate-200 text-slate-700 rounded-xl px-4 py-2.5 font-medium hover:bg-slate-300 transition-colors cursor-pointer text-sm font-bold"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>

                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Extracted Portfolio ({skills.length})
                            </h3>

                            <div className="space-y-3">
                                {skills.map((skill, idx) => (
                                    <div
                                        key={skill._id || idx}
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white group hover:border-brand-DEFAULT/30 transition-colors shadow-sm animate-in slide-in-from-left-2 duration-300"
                                    >
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">
                                                {skill.name}
                                            </p>

                                            <p className="text-xs text-slate-500 font-medium">
                                                {skill.experience} yrs digital history
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                removeSkill(idx)
                                            }
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {skills.length === 0 && (
                                    <div className="text-center py-6 text-sm text-slate-400">
                                        No skills added yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Income Predictor */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp className="w-24 h-24" />
                        </div>

                        <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
                            <Award className="w-4 h-4" />
                            Income Predictor Engine
                        </h2>

                        <div className="relative z-10 text-white">
                            <p className="text-3xl font-black mb-1">
                                ₹{dashboardData.earningsPotential}
                            </p>

                            <p className="text-sm text-slate-300 font-medium mb-4">
                                Predicted demand this week
                            </p>
                        </div>

                        <div className="relative z-10 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 text-sm">
                            Add{' '}
                            <span className="text-brand-light font-bold">
                                Electrician
                            </span>{' '}
                            to your skills to boost projected income by 18%.
                        </div>
                    </div>

                    {/* Digital Signature Component */}
                    <div className="mt-6 w-full">
                        <DigitalSignature />
                    </div>
                </div>

                {/* Right Column: Suggested Jobs */}
                <div className="lg:col-span-2 space-y-6">

                    {dashboardData?.activeContract && (
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-lg shadow-green-500/20 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">

                                <div>
                                    <span className="bg-white/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-2 inline-block">
                                        Active Contract
                                    </span>

                                    <h2 className="text-2xl font-black">
                                        {dashboardData.activeContract.jobTitle}
                                    </h2>

                                    <p className="font-medium text-green-100 mt-1">
                                        Employer:{' '}
                                        {dashboardData.activeContract.employerName}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setActiveContractId(
                                            dashboardData.activeContract._id
                                        )
                                    }
                                    className="w-full md:w-auto bg-white text-green-600 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    View Legal Contract
                                </button>
                            </div>

                            <Sparkles className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10" />
                        </div>
                    )}

                    {/* Header Tabs for Right Column */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                            <button
                                onClick={() => setActiveTab('applications')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'applications'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                My Applications ({dashboardData.myApplications?.length || 0})
                            </button>

                            <button
                                onClick={() => setActiveTab('opportunities')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'opportunities'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Live Job Opportunities ({jobs.length})
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm font-bold self-start sm:self-auto">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-DEFAULT opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-DEFAULT"></span>
                            </span>
                            <Navigation className="w-3.5 h-3.5" />
                            Live Engine Stream
                        </div>
                    </div>

                    {/* TAB 1: MY APPLICATIONS */}
                    {activeTab === 'applications' && (
                        <div className="space-y-4">
                            {dashboardData.myApplications?.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-slate-200 p-12 text-center rounded-3xl shadow-sm">
                                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="font-bold text-slate-700 text-lg">No Applications Submitted Yet</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                                        Browse the "Live Job Opportunities" tab to apply for nearby jobs matching your skills.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('opportunities')}
                                        className="mt-4 px-5 py-2.5 bg-brand-DEFAULT text-white rounded-xl font-bold text-sm hover:bg-brand-dark transition-all shadow-md"
                                    >
                                        Browse Live Jobs
                                    </button>
                                </div>
                            ) : (
                                dashboardData.myApplications?.map((appJob) => {
                                    // Determine worker's application status
                                    const appObj = appJob.applicants?.find(
                                        (a) => (a.worker?._id || a.worker)?.toString() === user._id?.toString()
                                    );
                                    const appStatus = appObj?.status || 'applied';

                                    const statusBadgeConfig = {
                                        applied: { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'Applied • Under Review' },
                                        hired: { bg: 'bg-green-100 text-green-800 border-green-300 animate-pulse', text: 'Accepted & Hired! 🎉' },
                                        rejected: { bg: 'bg-red-50 text-red-700 border-red-200', text: 'Application Not Selected' },
                                        'in-progress': { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: 'Work In Progress' },
                                        completed: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'Job Completed & Rated' }
                                    }[appStatus] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: appStatus };

                                    const employerName = appJob.employer?.name || (typeof appJob.employer === 'string' ? appJob.employer : 'Employer');

                                    return (
                                        <div
                                            key={appJob._id}
                                            className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${
                                                appStatus === 'hired'
                                                    ? 'border-green-400 shadow-md shadow-green-100'
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-3 py-1 border text-xs font-bold rounded-full uppercase tracking-wider ${statusBadgeConfig.bg}`}>
                                                            {statusBadgeConfig.text}
                                                        </span>

                                                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-brand-DEFAULT" />
                                                            {appJob.employer?.locationName || 'Nearby'}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-bold text-xl text-slate-900">
                                                        {appJob.title}
                                                    </h3>

                                                    <p className="text-sm font-semibold text-slate-600 mt-1">
                                                        Employer: <span className="text-slate-900 font-bold">{employerName}</span>
                                                    </p>
                                                </div>

                                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-right self-start sm:self-auto">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pay Offered</p>
                                                    <p className="text-xl font-black text-slate-900">₹{appJob.pay} <span className="text-xs font-normal text-slate-500">/ day</span></p>
                                                </div>
                                            </div>

                                            {/* Skills required */}
                                            {appJob.requiredSkills && appJob.requiredSkills.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {appJob.requiredSkills.map((sk, i) => (
                                                        <span key={i} className="text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                                                            {sk}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action Bar */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => {
                                                        setSelectedJobDetailId(appJob._id);
                                                        setSelectedDetailAppStatus(appStatus);
                                                    }}
                                                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4 text-slate-500" />
                                                    View Details
                                                </button>

                                                {appStatus === 'hired' && (
                                                    <button
                                                        onClick={() => {
                                                            if (dashboardData.activeContract?._id) {
                                                                setActiveContractId(dashboardData.activeContract._id);
                                                            } else {
                                                                alert('Contract is generated. Refreshing dashboard...');
                                                                fetchDash();
                                                            }
                                                        }}
                                                        className="px-5 py-2 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        View Digital Contract
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* TAB 2: LIVE JOB OPPORTUNITIES */}
                    {activeTab === 'opportunities' && (
                        <div className="grid gap-4">
                            {jobs.length === 0 && (
                                <div className="bg-white border-2 border-dashed border-slate-200 p-12 text-center rounded-3xl shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full border-t-transparent animate-spin"></div>
                                        <Search className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-700 text-lg">Listening for new jobs...</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                                        New jobs will instantly appear here when employers post them nearby.
                                    </p>
                                </div>
                            )}

                            {jobs.map((job) => {
                                const totalSlots = job.workerCount ?? 1;
                                const filledSlots = job.filledSlots ?? 0;
                                const openSlots = Math.max(0, totalSlots - filledSlots);
                                const isFull = job.status === 'in-progress' || openSlots === 0;

                                return (
                                    <div
                                        key={job.id}
                                        className={`bg-white border border-slate-200 p-6 rounded-2xl shadow-sm transform transition-all duration-300 ${
                                            job.status === 'Hired!'
                                                ? 'scale-[1.02] border-green-500 shadow-xl shadow-green-100 z-10'
                                                : 'hover:shadow-md group'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 font-bold text-xs rounded-full uppercase tracking-wider shadow-sm">
                                                        {job.status || 'New'}
                                                    </span>

                                                    <span className="text-slate-600 text-xs font-bold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                        <MapPin className="w-3.5 h-3.5 text-brand-DEFAULT" />
                                                        {job.location && typeof job.location === 'string' ? job.location : 'Nearby'}
                                                    </span>

                                                    {totalSlots > 1 && (
                                                        isFull ? (
                                                            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                                                All positions filled
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-bold text-brand-dark bg-brand-light px-2 py-0.5 rounded-full">
                                                                {openSlots} of {totalSlots} positions open
                                                            </span>
                                                        )
                                                    )}
                                                </div>

                                                <h3 className="font-bold text-xl text-slate-900 group-hover:text-brand-DEFAULT transition-colors">
                                                    {job.title}
                                                </h3>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-xs font-bold flex items-center justify-center text-slate-500">
                                                        {job.employer ? job.employer[0] : 'E'}
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-600">
                                                        {job.employer || 'Employer'}{' '}
                                                        <span className="font-normal opacity-50 ml-1">
                                                            • Verified Employer
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="inline-flex flex-col items-center justify-center bg-brand-light border border-brand-DEFAULT/20 rounded-xl px-4 py-2 group-hover:bg-brand-DEFAULT group-hover:text-white transition-colors">
                                                    <span className="text-[10px] text-brand-dark group-hover:text-brand-light font-bold uppercase tracking-wider mb-0.5">
                                                        Match Fit
                                                    </span>
                                                    <span className="text-xl font-black text-brand-DEFAULT group-hover:text-white leading-none">
                                                        {job.match || '90%'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-5 border-t border-slate-100 mt-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedJobDetailId(job.id || job._id);
                                                    setSelectedDetailAppStatus(job.actionState === 'applied' ? 'applied' : null);
                                                }}
                                                className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                                            >
                                                <Eye className="w-4 h-4 text-slate-500" />
                                                Full Details
                                            </button>

                                            {job.status === 'Hired!' ? (
                                                <div className="flex-1 bg-green-50 text-green-700 border border-green-200 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse text-xs">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    You Are Hired!
                                                </div>
                                            ) : job.actionState === 'applied' ? (
                                                <div className="flex-1 bg-amber-50 text-amber-800 border border-amber-200 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs">
                                                    <Clock className="w-4 h-4 text-amber-600" />
                                                    Application Submitted
                                                </div>
                                            ) : isFull ? (
                                                <div className="flex-1 bg-slate-50 text-slate-400 border border-slate-200 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs">
                                                    Positions Full
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleApply(
                                                                job.id,
                                                                job.employerId || job.employer
                                                            )
                                                        }
                                                        className="flex-1 bg-brand-DEFAULT text-white py-2.5 rounded-xl font-bold hover:bg-brand-dark transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md text-xs"
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                        Apply Instantly
                                                    </button>

                                                    <button
                                                        onClick={() => handleDecline(job.id)}
                                                        className="px-4 py-2.5 bg-white text-slate-500 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold border border-slate-200 text-xs"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Job Details Modal overlay */}
            {selectedJobDetailId && (
                <JobDetailModal
                    jobId={selectedJobDetailId}
                    userToken={user?.token}
                    onClose={() => {
                        setSelectedJobDetailId(null);
                        setSelectedDetailAppStatus(null);
                    }}
                    onApply={(jId, empId) => handleApply(jId, empId)}
                    myApplicationStatus={selectedDetailAppStatus}
                    onOpenContract={() => {
                        setSelectedJobDetailId(null);
                        if (dashboardData.activeContract?._id) {
                            setActiveContractId(dashboardData.activeContract._id);
                        }
                    }}
                />
            )}

            {/* Conditional Contract Modal overlay */}
            {activeContractId && (
                <ContractViewer
                    contractId={activeContractId}
                    onClose={() => setActiveContractId(null)}
                />
            )}
        </div>
    );
};

export default WorkerDashboard;