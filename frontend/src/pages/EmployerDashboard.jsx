import { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { Briefcase, Users, Plus, CheckCircle, TrendingUp, AlertCircle, XCircle, Sparkles, Eye, MapPin, Award, Star } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import ContractViewer from '../components/ContractViewer';
import JobDetailModal from '../components/JobDetailModal';

const EmployerDashboard = () => {
    const { user } = useContext(AuthContext);
    const socketRef = useRef(null);
    const [data, setData] = useState({ activeJobs: [], insights: {}, suggestions: [] });
    const [activeContractId, setActiveContractId] = useState(null);
    const [selectedJobDetailId, setSelectedJobDetailId] = useState(null);
    const [processingActionKey, setProcessingActionKey] = useState(null);
    const [submittingJob, setSubmittingJob] = useState(false);
    
    // Create Job Modal State
    const [title, setTitle] = useState('');
    const [pay, setPay] = useState('');
    const [jobType, setJobType] = useState('Small');
    const [workerCount, setWorkerCount] = useState(1);
    const [requiredSkill, setRequiredSkill] = useState('Laborer');
    
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

    const fetchDashboard = useCallback(async () => {
        if (!user?.token) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const res = await axios.get(
                `${API_URL}/api/dashboard/employer`,
                config
            );

            setData(res.data);
        } catch (error) {
            console.error('Failed to load employer dashboard', error);
        }
    }, [user, API_URL]);

    useEffect(() => {
        if (!user?.token) return;

        const loadDashboard = () => {
            fetchDashboard();
        };

        const initialLoad = setTimeout(loadDashboard, 0);

        const newSocket = io(API_URL);
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            newSocket.emit('register', user._id);
        });

        // Listen for new workers applying immediately
        newSocket.on('worker_applied', () => {
            fetchDashboard();
        });

        // Real-time listener for persistent notification updates
        newSocket.on('notification:new', () => {
            fetchDashboard();
        });

        return () => {
            clearTimeout(initialLoad);
            newSocket.close();
            socketRef.current = null;
        };
    }, [user, API_URL, fetchDashboard]);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            setSubmittingJob(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/api/jobs/create`, { 
                employer: user._id,
                title, 
                pay: Number(pay),
                jobType,
                requiredSkills: [requiredSkill], 
                workerCount: Number(workerCount),
                location: { coordinates: [77.216, 28.631] },
                description: `Urgent ${requiredSkill} required for ${jobType === 'Small' ? 'quick task' : 'project'}.` 
            }, config);
            
            setTitle('');
            setPay('');
            await fetchDashboard();
        } catch(error) {
            console.error('Error creating job:', error);
            alert('Failed to broadcast job. Please try again.');
        } finally {
            setSubmittingJob(false);
        }
    };

    const handleSelectWorker = async (jobId, workerId, status, jobTitle) => {
        const actionKey = `${jobId}_${workerId}_${status}`;
        try {
            setProcessingActionKey(actionKey);

            if (socketRef.current) {
                socketRef.current.emit('job_select', {
                    jobId,
                    workerId,
                    status,
                    title: jobTitle || 'Active Job'
                });
            }

            if (status === 'hired') {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.post(`${API_URL}/api/contract/generate-contract`, {
                    jobId,
                    workerId
                }, config);
                
                setActiveContractId(res.data._id);
            }

            setTimeout(fetchDashboard, 400);
        } catch(error) {
            console.error("Contract generation or selection failed", error);
            alert("Action failed. Please verify your profile settings.");
        } finally {
            setProcessingActionKey(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-brand-dark" /> Employer Dashboard
                    </h1>
                    <p className="text-slate-500 mt-2">Post jobs and manage your active workforce applications in real time.</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-brand-DEFAULT rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Active Jobs</p>
                        <p className="text-3xl font-black text-slate-800">{data.insights?.activeNow || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Applications</p>
                        <p className="text-3xl font-black text-slate-800">{data.insights?.totalApplications || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Posted</p>
                        <p className="text-3xl font-black text-slate-800">{data.insights?.totalPosted || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Post Job & Suggestions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-lg mb-4 text-slate-900">Post a Live Job</h2>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Job Title</label>
                                <input 
                                    required type="text" placeholder="e.g., Plumber needed for bathroom repair"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-semibold focus:border-brand-DEFAULT outline-none focus:ring-2 focus:ring-brand-DEFAULT/20 transition-all bg-slate-50 text-sm"
                                    value={title} onChange={e=>setTitle(e.target.value)}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Task Type</label>
                                    <select 
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:border-brand-DEFAULT outline-none bg-slate-50 text-slate-700 text-sm" 
                                        value={jobType} onChange={e=>setJobType(e.target.value)}
                                    >
                                        <option value="Small">Small Task</option>
                                        <option value="Large">Large Project</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Primary Skill</label>
                                    <select 
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:border-brand-DEFAULT outline-none bg-slate-50 text-slate-700 text-sm" 
                                        value={requiredSkill} onChange={e=>setRequiredSkill(e.target.value)}
                                    >
                                        <option value="Laborer">General Laborer</option>
                                        <option value="Plumber">Plumber</option>
                                        <option value="Electrician">Electrician</option>
                                        <option value="Carpenter">Carpenter</option>
                                        <option value="Painter">Painter</option>
                                        <option value="Mason">Mason</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Positions Needed</label>
                                    <input 
                                        required type="number" placeholder="Workers Needed" min="1"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-semibold focus:border-brand-DEFAULT outline-none bg-slate-50 text-sm"
                                        value={workerCount} onChange={e=>setWorkerCount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Pay / Worker (₹)</label>
                                    <input 
                                        required type="number" placeholder="Pay / Worker (₹)" min="100"
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 font-semibold focus:border-brand-DEFAULT outline-none bg-slate-50 text-sm"
                                        value={pay} onChange={e=>setPay(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submittingJob}
                                className="w-full bg-brand-DEFAULT text-white rounded-xl py-3 font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-DEFAULT/20 cursor-pointer active:scale-[0.98] text-sm disabled:opacity-60"
                            >
                                {submittingJob ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Broadcasting Job...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5"/> Broadcast Job Now
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-base mb-3 text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-DEFAULT"/> Highly Rated Workers Nearby
                        </h2>
                        <div className="space-y-3">
                            {data.suggestions?.map((worker, i) => (
                                <div key={i} className="bg-white p-3 border border-slate-200 rounded-xl flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{worker.name}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                                            <span className="text-amber-600 font-bold flex items-center gap-0.5">
                                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {worker.rating?.toFixed(1) || '4.0'}
                                            </span>
                                            • {worker.primarySkill || 'Skilled Worker'}
                                        </p>
                                    </div>
                                    <span className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-lg text-slate-600 border border-slate-200">
                                        Available
                                    </span>
                                </div>
                            ))}
                            {(!data.suggestions || data.suggestions.length === 0) && (
                                <p className="text-xs text-slate-400 font-medium italic text-center py-2">No recommended workers available right now.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Manage Incoming Applications */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl text-slate-900">Manage Posted Jobs & Applicants</h2>
                        <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                            {data.activeJobs?.length || 0} active job listing(s)
                        </span>
                    </div>

                    <div className="space-y-6">
                        {(!data.activeJobs || data.activeJobs.length === 0) ? (
                            <div className="bg-white p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center shadow-sm">
                                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="font-bold text-slate-700 text-lg">No Active Jobs Posted</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
                                    Use the form on the left to broadcast a new job to nearby workers instantly.
                                </p>
                            </div>
                        ) : (
                            data.activeJobs.map((job) => {
                                const totalSlots = job.totalSlots ?? job.workerCount ?? 1;
                                const filledSlots = job.filledSlots ?? 0;
                                const openSlots = job.openSlots ?? Math.max(0, totalSlots - filledSlots);
                                const allFilled = filledSlots >= totalSlots;
                                const fillPct = Math.min(100, Math.round((filledSlots / totalSlots) * 100));

                                const statusConfig = {
                                    open: { bg: 'bg-green-50 text-green-700 border-green-200', label: 'Open' },
                                    'partially-filled': { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Partially Filled' },
                                    'in-progress': { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'In Progress' },
                                    completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' }
                                }[job.status] || { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: job.status };

                                return (
                                    <div key={job._id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                                        
                                        {/* Job Header */}
                                        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase border ${statusConfig.bg}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500">
                                                            {job.jobType || 'Task'}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                                                        {job.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-slate-900 bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                                        ₹{job.pay} <span className="text-xs font-normal text-slate-500">/ worker</span>
                                                    </span>

                                                    <button
                                                        onClick={() => setSelectedJobDetailId(job._id)}
                                                        className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-sm"
                                                        title="View full job details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="flex items-center gap-3 mt-4">
                                                <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className={`h-2.5 rounded-full transition-all duration-500 ${allFilled ? 'bg-green-500' : 'bg-brand-DEFAULT'}`}
                                                        style={{ width: `${fillPct}%` }}
                                                    />
                                                </div>

                                                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                                                    {filledSlots} / {totalSlots} slots filled
                                                </span>

                                                {!allFilled && (
                                                    <span className="text-xs font-bold text-brand-dark bg-brand-light px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                                        {openSlots} open
                                                    </span>
                                                )}

                                                {allFilled && (
                                                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                                        ✓ Positions Full
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Applicants List */}
                                        <div className="p-0">
                                            {(!job.applicants || job.applicants.length === 0) ? (
                                                <p className="text-center p-8 text-slate-400 font-medium italic text-sm">
                                                    No worker applications received yet. Live engine is searching nearby workers...
                                                </p>
                                            ) : (
                                                <ul className="divide-y divide-slate-100">
                                                    {job.applicants.map((app, i) => {
                                                        const worker = app.worker;
                                                        const workerId = worker?._id || worker;
                                                        const isHired = app.status === 'hired';

                                                        const hireKey = `${job._id}_${workerId}_hired`;
                                                        const rejectKey = `${job._id}_${workerId}_rejected`;
                                                        const isProcessing = processingActionKey === hireKey || processingActionKey === rejectKey;

                                                        return (
                                                            <li key={i} className="p-5 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                                                                <div className="space-y-1.5 flex-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="font-bold text-slate-900 text-base">
                                                                            {worker?.name || 'Worker Applicant'}
                                                                        </p>

                                                                        {worker?.rating > 0 && (
                                                                            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                                <Star className="w-3 h-3 fill-amber-500" /> {worker.rating.toFixed(1)} ⭐
                                                                            </span>
                                                                        )}

                                                                        {worker?.primarySkill && (
                                                                            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                                                                {worker.primarySkill}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Worker skills pill badges */}
                                                                    {worker?.skills && worker.skills.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                                            {worker.skills.map((sk, skIdx) => (
                                                                                <span key={skIdx} className="text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100 px-2 py-0.5 rounded-md">
                                                                                    {sk.name} {sk.experience ? `(${sk.experience}y)` : ''}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {worker?.wageExpectation && (
                                                                        <p className="text-xs text-slate-500 font-medium">
                                                                            Wage expectation: <span className="font-bold text-slate-700">₹{worker.wageExpectation}/day</span>
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Applicant Action Buttons / Status */}
                                                                <div className="flex items-center gap-2 self-end md:self-center">
                                                                    {app.status === 'applied' ? (
                                                                        allFilled ? (
                                                                            <span className="text-xs text-slate-400 font-bold italic px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                                                                                Positions Full
                                                                            </span>
                                                                        ) : (
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    disabled={isProcessing}
                                                                                    onClick={() => handleSelectWorker(job._id, workerId, 'hired', job.title)}
                                                                                    className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-green-700 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                                                                                >
                                                                                    {processingActionKey === hireKey ? (
                                                                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                    ) : (
                                                                                        <CheckCircle className="w-4 h-4"/>
                                                                                    )}
                                                                                    Accept & Hire
                                                                                </button>

                                                                                <button
                                                                                    disabled={isProcessing}
                                                                                    onClick={() => handleSelectWorker(job._id, workerId, 'rejected', job.title)}
                                                                                    className="bg-white border border-slate-200 text-slate-500 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 transition-all disabled:opacity-50"
                                                                                >
                                                                                    {processingActionKey === rejectKey ? (
                                                                                        <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                                                                    ) : (
                                                                                        <XCircle className="w-4 h-4"/>
                                                                                    )}
                                                                                    Reject
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                    ) : isHired ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="px-3 py-1 rounded-xl font-bold text-xs uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                                                                                ✓ Hired
                                                                            </span>
                                                                            <button
                                                                                onClick={() => {
                                                                                    axios.get(`${API_URL}/api/contract/generate-contract`, { headers: { Authorization: `Bearer ${user.token}` } })
                                                                                        .catch(() => {});
                                                                                }}
                                                                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                                                                            >
                                                                                View Contract
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="px-3 py-1 rounded-xl font-bold text-xs uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                                                                            Not Selected
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            
            {/* Job Detail Modal Overlay */}
            {selectedJobDetailId && (
                <JobDetailModal 
                    jobId={selectedJobDetailId}
                    userToken={user?.token}
                    onClose={() => setSelectedJobDetailId(null)}
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

export default EmployerDashboard;
