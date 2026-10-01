import { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, Users, Award, Calendar, CheckCircle, AlertCircle, FileText, Star, Briefcase } from 'lucide-react';
import axios from 'axios';

const JobDetailModal = ({ jobId, userToken, onClose, onApply, myApplicationStatus, onOpenContract }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

    useEffect(() => {
        if (!jobId) return;

        const fetchJob = async () => {
            try {
                setLoading(true);
                const config = {
                    headers: { Authorization: `Bearer ${userToken}` }
                };
                const res = await axios.get(`${API_URL}/api/jobs/${jobId}`, config);
                setJob(res.data);
            } catch (err) {
                console.error('Error fetching job detail:', err);
                setError('Failed to load job details.');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId, userToken, API_URL]);

    if (!jobId) return null;

    const totalSlots = job?.workerCount || 1;
    const filledSlots = job?.applicants ? job.applicants.filter(a => a.status === 'hired').length : (job?.filledSlots || 0);
    const openSlots = Math.max(0, totalSlots - filledSlots);
    const isFull = job?.status === 'in-progress' || openSlots === 0;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase rounded-full">Open</span>;
            case 'partially-filled':
                return <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase rounded-full">Partially Filled</span>;
            case 'in-progress':
                return <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase rounded-full">In Progress</span>;
            case 'completed':
                return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase rounded-full">Completed</span>;
            default:
                return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-full">{status || 'Open'}</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-8">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg backdrop-blur-md">
                            {job?.jobType || 'Small Task'}
                        </span>
                        {job && getStatusBadge(job.status)}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {loading ? 'Loading Job Details...' : job?.title}
                    </h2>

                    {job?.employer && (
                        <div className="flex items-center gap-3 mt-3 text-slate-300 text-sm">
                            <div className="w-7 h-7 rounded-full bg-brand-DEFAULT text-white font-bold text-xs flex items-center justify-center">
                                {job.employer.name ? job.employer.name[0].toUpperCase() : 'E'}
                            </div>
                            <span className="font-semibold text-white">{job.employer.name || 'Employer'}</span>
                            {job.employer.rating > 0 && (
                                <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded border border-yellow-400/30">
                                    <Star className="w-3 h-3 fill-yellow-300" /> {job.employer.rating.toFixed(1)}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8 space-y-6">
                    {loading ? (
                        <div className="py-12 text-center text-slate-400 font-bold flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-brand-DEFAULT border-t-transparent rounded-full animate-spin"></div>
                            Fetching job information...
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm font-bold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" /> {error}
                        </div>
                    ) : (
                        <>
                            {/* Key Stats Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <DollarSign className="w-3.5 h-3.5 text-brand-DEFAULT" /> Pay Rate
                                    </p>
                                    <p className="text-xl font-black text-slate-900">₹{job.pay} <span className="text-xs font-normal text-slate-500">/ day</span></p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5 text-brand-DEFAULT" /> Availability
                                    </p>
                                    <p className="text-base font-black text-slate-900">
                                        {filledSlots} / {totalSlots} <span className="text-xs font-normal text-slate-500">filled</span>
                                    </p>
                                    <p className="text-[11px] font-bold text-brand-dark">{openSlots} slots remaining</p>
                                </div>

                                <div className="col-span-2 sm:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-brand-DEFAULT" /> Location
                                    </p>
                                    <p className="text-sm font-bold text-slate-800 truncate">
                                        {job.employer?.locationName || 'Hyperlocal (Nearby)'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {job.description && (
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                                    <p className="text-slate-700 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed font-medium">
                                        {job.description}
                                    </p>
                                </div>
                            )}

                            {/* Required Skills */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-slate-400" /> Required Skills ({job.requiredSkills?.length || 0})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.requiredSkills?.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold text-xs rounded-xl shadow-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Application Status Banner if Worker applied */}
                            {myApplicationStatus && (
                                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                                    myApplicationStatus === 'hired'
                                        ? 'bg-green-50 border-green-200 text-green-900'
                                        : myApplicationStatus === 'rejected'
                                        ? 'bg-red-50 border-red-200 text-red-900'
                                        : 'bg-amber-50 border-amber-200 text-amber-900'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        {myApplicationStatus === 'hired' ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                        ) : myApplicationStatus === 'rejected' ? (
                                            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                        ) : (
                                            <Briefcase className="w-6 h-6 text-amber-600 flex-shrink-0" />
                                        )}
                                        <div>
                                            <p className="font-bold text-sm">
                                                {myApplicationStatus === 'hired'
                                                    ? 'Application Accepted! You are Hired'
                                                    : myApplicationStatus === 'rejected'
                                                    ? 'Application Not Selected'
                                                    : 'Application Pending Review'}
                                            </p>
                                            <p className="text-xs opacity-80 font-medium mt-0.5">
                                                {myApplicationStatus === 'hired'
                                                    ? 'The employer selected your application for this job contract.'
                                                    : myApplicationStatus === 'rejected'
                                                    ? 'This position was filled or another candidate was selected.'
                                                    : 'Your profile has been submitted to the employer.'}
                                            </p>
                                        </div>
                                    </div>

                                    {myApplicationStatus === 'hired' && onOpenContract && (
                                        <button
                                            onClick={onOpenContract}
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-colors shadow-sm flex-shrink-0"
                                        >
                                            View Legal Contract
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Close
                                </button>

                                {onApply && !myApplicationStatus && (
                                    <button
                                        onClick={() => {
                                            onApply(job._id, job.employer?._id || job.employer);
                                            onClose();
                                        }}
                                        disabled={isFull}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center gap-2 ${
                                            isFull
                                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                                : 'bg-brand-DEFAULT hover:bg-brand-dark active:scale-95 shadow-brand-DEFAULT/20'
                                        }`}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {isFull ? 'Positions Full' : 'Apply Now'}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailModal;
