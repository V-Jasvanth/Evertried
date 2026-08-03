import { useState, useContext, useEffect } from 'react';
import { Briefcase, Users, Plus, CheckCircle, TrendingUp, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import ContractViewer from '../components/ContractViewer';

const EmployerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [data, setData] = useState({ activeJobs: [], insights: {}, suggestions: [] });
    const [activeContractId, setActiveContractId] = useState(null);
    
    // Create Job Modal
    const [title, setTitle] = useState('');
    const [pay, setPay] = useState('');
    const [jobType, setJobType] = useState('Small');
    const [workerCount, setWorkerCount] = useState(1);
    const [requiredSkill, setRequiredSkill] = useState('Laborer');
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchDashboard = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/api/dashboard/employer`, config);
            setData(res.data);
        } catch (error) {
            console.error('Failed to load employer dashboard', error);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchDashboard();
        
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('register', user._id);
        });

        // Listen for new workers applying immediately
        newSocket.on('worker_applied', (applicationData) => {
            fetchDashboard(); // Re-fetch to update incoming applications
        });

        return () => newSocket.close();
    }, [user, API_URL]);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/api/jobs/create`, { 
                employer: user._id,
                title, 
                pay,
                jobType,
                requiredSkills: [requiredSkill], 
                workerCount,
                location: { coordinates: [77.216, 28.631] }, // Fake default coordinates
                description: 'Urgent' 
            }, config);
            
            setTitle('');
            setPay('');
            fetchDashboard(); // Refresh Dashboard
            alert('Job Broadcasted to Workers instantly!');
        } catch(error) {
            console.error(error);
        }
    };

    const handleSelectWorker = async (jobId, workerId, status) => {
        try {
            if (socket) {
                socket.emit('job_select', { jobId, workerId, status, title: 'Active Job' });
            }

            if (status === 'hired') {
                // Automatically generate the digital contract
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.post(`${API_URL}/api/contract/generate-contract`, {
                    jobId,
                    workerId
                }, config);
                
                // Pop open the formal contract preview
                setActiveContractId(res.data._id);
            }

            // Rapid optimistic fetch
            setTimeout(fetchDashboard, 500);
        } catch(error) {
            console.error("Contract generation or selection failed", error);
            alert("Failed. Did you complete your profile signature?");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-brand-dark" /> Employer Dashboard
                </h1>
                <p className="text-slate-500 mt-2">Post jobs and manage your active workforce.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-brand-DEFAULT rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Active Jobs</p>
                        <p className="text-3xl font-black text-slate-800">{data.insights.activeNow || 0}</p>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Applications</p>
                        <p className="text-3xl font-black text-slate-800">{data.insights.totalApplications || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Create & Suggest */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-lg mb-4">Post a live job</h2>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <input 
                                required type="text" placeholder="Job Title (e.g., Plumber needed)"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-semibold focus:border-brand-DEFAULT outline-none focus:ring-4 focus:ring-brand-DEFAULT/10 transition-all bg-slate-50"
                                value={title} onChange={e=>setTitle(e.target.value)}
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <select 
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-semibold focus:border-brand-DEFAULT outline-none bg-slate-50 text-slate-700" 
                                    value={jobType} onChange={e=>setJobType(e.target.value)}
                                >
                                    <option value="Small">Small Task</option>
                                    <option value="Large">Large Project</option>
                                </select>
                                
                                <select 
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-semibold focus:border-brand-DEFAULT outline-none bg-slate-50 text-slate-700" 
                                    value={requiredSkill} onChange={e=>setRequiredSkill(e.target.value)}
                                >
                                    <option value="Laborer">General Laborer</option>
                                    <option value="Plumber">Plumber</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Carpenter">Carpenter</option>
                                    <option value="Painter">Painter</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input 
                                    required type="number" placeholder="Workers Needed" min="1"
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-semibold focus:border-brand-DEFAULT outline-none bg-slate-50"
                                    value={workerCount} onChange={e=>setWorkerCount(e.target.value)}
                                />
                                <input 
                                    required type="number" placeholder="Pay / Worker (₹)" min="100"
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-semibold focus:border-brand-DEFAULT outline-none bg-slate-50"
                                    value={pay} onChange={e=>setPay(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="w-full bg-brand-DEFAULT text-white rounded-xl py-3 font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-DEFAULT/20 cursor-pointer active:scale-[0.98]">
                                <Plus className="w-5 h-5"/> Broadcast Job Now
                            </button>
                        </form>
                    </div>

                    <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand-DEFAULT"/> Smart Suggestions</h2>
                        <div className="space-y-3">
                            {data.suggestions?.map((worker, i) => (
                                <div key={i} className="bg-white p-3 border border-slate-200 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm">{worker.name}</p>
                                        <p className="text-xs text-slate-500">{worker.primarySkill || 'Skilled Laborer'} • {worker.rating} ⭐</p>
                                    </div>
                                    <button className="text-xs bg-slate-100 font-bold px-3 py-1.5 rounded-lg text-slate-700 hover:bg-brand-DEFAULT hover:text-white transition-all">Invite</button>
                                </div>
                            ))}
                            {data.suggestions?.length === 0 && <p className="text-xs text-slate-400 font-bold italic">No top workers found right now.<br/>Keep posting jobs!</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Management */}
                <div className="lg:col-span-2">
                    <h2 className="font-bold text-xl mb-6">Manage Incoming Applications</h2>
                    <div className="space-y-6">
                        {data.activeJobs?.length === 0 ? (
                            <div className="bg-white p-10 border border-dashed border-slate-300 rounded-2xl text-center">
                                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-500 font-bold">You don't have any active jobs yet.</p>
                            </div>
                        ) : data.activeJobs?.map(job => {
                            const totalSlots = job.totalSlots ?? job.workerCount ?? 1;
                            const filledSlots = job.filledSlots ?? 0;
                            const openSlots = job.openSlots ?? Math.max(0, totalSlots - filledSlots);
                            const allFilled = filledSlots >= totalSlots;
                            const fillPct = Math.round((filledSlots / totalSlots) * 100);

                            const statusColor = {
                                'open': 'bg-brand-light text-brand-dark',
                                'partially-filled': 'bg-amber-50 text-amber-700',
                                'in-progress': 'bg-green-50 text-green-700',
                            }[job.status] ?? 'bg-slate-100 text-slate-600';

                            return (
                            <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-black text-lg text-slate-800">{job.title} <span className="font-medium text-brand-dark ml-2">₹{job.pay}/day</span></h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColor}`}>{job.status}</span>
                                    </div>

                                    {/* Slot progress bar */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${allFilled ? 'bg-green-500' : 'bg-brand-DEFAULT'}`}
                                                style={{ width: `${fillPct}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                                            {filledSlots} / {totalSlots} slots filled
                                        </span>
                                        {!allFilled && (
                                            <span className="text-xs font-bold text-brand-dark bg-brand-light px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {openSlots} open
                                            </span>
                                        )}
                                        {allFilled && (
                                            <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                ✓ Full
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-0">
                                    {job.applicants?.length === 0 ? (
                                        <p className="text-center p-6 text-slate-400 font-medium italic">Pending live applications...</p>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {job.applicants.map((app, i) => (
                                                <li key={i} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-base">{app.worker?.name || 'Unknown Worker'}</p>
                                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                            <span className="font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">{app.worker?.rating || 0} ⭐ Rating</span>
                                                            {app.worker?.skills && <span>• {app.worker.skills.length} skills listed</span>}
                                                        </p>
                                                    </div>
                                                    
                                                    {app.status === 'applied' ? (
                                                        allFilled ? (
                                                            // All slots taken — can't hire more
                                                            <span className="text-xs text-slate-400 font-bold italic px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                                                All slots filled
                                                            </span>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSelectWorker(job._id, app.worker?._id, 'hired')}
                                                                    className="bg-green-500 text-white p-2 px-4 rounded-xl font-bold flex items-center gap-1 hover:bg-green-600 shadow-sm shadow-green-200 active:scale-95 transition-all"
                                                                >
                                                                    <CheckCircle className="w-4 h-4"/> Hire
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSelectWorker(job._id, app.worker?._id, 'rejected')}
                                                                    className="bg-white border-2 border-slate-200 text-slate-400 p-2 px-4 rounded-xl font-bold flex items-center gap-1 hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:scale-95 transition-all"
                                                                >
                                                                    <XCircle className="w-4 h-4"/> Reject
                                                                </button>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider ${app.status === 'hired' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                                            {app.status}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            </div>
            
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
