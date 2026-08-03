import { ArrowRight, Drill, Clock, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="flex-1 flex flex-col">
            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden flex flex-col justify-center min-h-[85vh]">
                <div className="absolute inset-0 bg-slate-50"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-light/50 via-slate-50 to-slate-50"></div>
                
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-brand-DEFAULT/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-light text-brand-dark text-sm font-semibold mb-8 border border-brand-DEFAULT/20 shadow-sm">
                                <span className="flex h-2 w-2 rounded-full bg-brand-DEFAULT animate-pulse"></span>
                                EverTried AI Matching Engine 1.0
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                                Hire skilled labor, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-DEFAULT to-indigo-600">instantly.</span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
                                Eliminate the middlemen. Our platform matches plumbers, electricians, and tradespeople directly to local employers based on skill, availability, and an intelligent proximity algorithm.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/employer" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5">
                                    I need workers
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/worker" className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-900 font-semibold border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all hover:-translate-y-0.5">
                                    I am a worker
                                </Link>
                            </div>
                        </div>

                        {/* Interactive UI Mockup */}
                        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-DEFAULT/20 to-transparent blur-2xl rounded-3xl"></div>
                            <div className="relative bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-bold text-slate-900 text-xl tracking-tight">Active Match</h3>
                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold tracking-wide uppercase">In Progress</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                            <Drill className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Commercial Pipe Fitting</h4>
                                            <p className="text-sm text-slate-500 mt-1">Requires 2 Plumbers</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-100 w-full"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                                            <p className="font-bold text-slate-900 flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-DEFAULT" /> 3 mins away</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <p className="text-xs text-slate-500 font-medium mb-1">Match Quality</p>
                                            <p className="font-bold text-slate-900 flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 98% Fit</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-brand-light/50 p-3 rounded-xl border border-brand-DEFAULT/10">
                                        <div className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-DEFAULT opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-DEFAULT"></span>
                                        </div>
                                        <p className="text-sm font-medium text-brand-dark">Agent is routing task to Ravi...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
