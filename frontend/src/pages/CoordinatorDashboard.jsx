import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Activity, Users, MapPin, CheckCircle, Clock } from 'lucide-react';

const CoordinatorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState({ largeScaleJobs: [], stats: {} });
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchDashboard = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/api/dashboard/coordinator`, config);
            setData(res.data);
        } catch (error) {
            console.error('Failed to load coordinator dashboard', error);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchDashboard();
        // Basic Real-time mock via polling
        const interval = setInterval(fetchDashboard, 10000);
        return () => clearInterval(interval);
    }, [user, API_URL]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 w-full">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Activity className="w-8 h-8 text-brand-DEFAULT" /> Coordinator Command Center
                </h1>
                <p className="text-slate-500 mt-2 text-lg">System-wide assignment tracking and job monitoring.</p>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Active Sites</p>
                        <p className="text-3xl font-black text-slate-800">{data.stats.totalSystemJobs || 0}</p>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Workers Deployed</p>
                        <p className="text-3xl font-black text-slate-800">{data.stats.totalActiveAssignments || 0}</p>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4 text-white">
                    <div className="w-14 h-14 bg-white/10 text-brand-light rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">System Health</p>
                        <p className="text-3xl font-black text-brand-light">{data.stats.systemHealth || 'Booting...'}</p>
                    </div>
                </div>
            </div>

            {/* Large Scale Job Monitoring */}
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" /> Active Job Progress
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.largeScaleJobs?.length === 0 ? (
                    <div className="bg-white p-10 border border-dashed border-slate-300 rounded-2xl text-center col-span-2">
                        <p className="text-slate-500 font-bold">No active jobs in the system.</p>
                    </div>
                ) : (
                    data.largeScaleJobs?.map((job, idx) => {
                        const hiredCount = job.applicants.filter(a => a.status === 'hired').length;
                        const totalNeeded = 5; // mocked arbitrary number for UX
                        const progress = Math.min(100, Math.round((hiredCount / totalNeeded) * 100));
                        
                        return (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800">{job.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium">Employer: {job.employer?.name || 'Local Company'} • {job.location && typeof job.location === 'string' ? job.location : 'Site'}</p>
                                    </div>
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {job.status}
                                    </span>
                                </div>
                                
                                <div className="mb-2 flex justify-between text-sm font-bold">
                                    <span className="text-slate-600">Fulfillment Progress</span>
                                    <span className="text-brand-DEFAULT">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                                    <div className="bg-brand-DEFAULT h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>

                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assigned Workforce</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.applicants.filter(a => a.status === 'hired').map((applicant, i) => (
                                        <div key={i} className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 text-xs font-bold">
                                            <CheckCircle className="w-3 h-3 text-green-500" /> {applicant.worker?.name || `Worker #${i+1}`}
                                        </div>
                                    ))}
                                    {hiredCount === 0 && <span className="text-sm text-slate-400 italic">Pending Assignments...</span>}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default CoordinatorDashboard;
