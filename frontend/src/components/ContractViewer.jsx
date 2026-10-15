import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, CheckCircle, ShieldCheck, AlertCircle, RefreshCw, X } from 'lucide-react';

const ContractViewer = ({ contractId, onClose }) => {
    const { user } = useContext(AuthContext);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [signing, setSigning] = useState(false);
    const [signStatus, setSignStatus] = useState(null);

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

    const fetchContract = useCallback(async () => {
        if (!contractId || !user?.token) return;
        try {
            setLoading(true);
            setError(null);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${API_URL}/api/contract/${contractId}`, config);
            setContract(data);
        } catch (err) {
            console.error("Error fetching contract:", err);
            if (err.response?.status === 401) {
                setError("Your session has expired. Please sign in again.");
            } else {
                setError("Unable to load the digital contract. Please check your network connection.");
            }
        } finally {
            setLoading(false);
        }
    }, [contractId, user?.token, API_URL]);

    useEffect(() => {
        fetchContract();
    }, [fetchContract]);

    const handleSign = async () => {
        setSigning(true);
        setSignStatus(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${API_URL}/api/contract/${contractId}/sign`, {}, config);
            setContract(data);
            setSignStatus({ type: 'success', message: 'Digital Signature applied successfully!' });
        } catch (err) {
            console.error("Signing failed", err);
            const msg = err.response?.data?.message || "Failed to sign contract. Please ensure you have generated your profile signature in your profile first.";
            setSignStatus({ type: 'error', message: msg });
        } finally {
            setSigning(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white max-w-sm w-full rounded-3xl p-8 shadow-2xl text-center">
                    <div className="w-10 h-10 rounded-full border-4 border-brand-DEFAULT border-t-transparent animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-slate-800 text-sm">Loading digital contract...</p>
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl text-center border border-slate-200">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-slate-900 text-lg mb-2">Contract Unavailable</h3>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                        {error || "Could not retrieve contract details at this time."}
                    </p>
                    <div className="flex gap-3 justify-center">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        )}
                        <button
                            onClick={fetchContract}
                            className="px-5 py-2.5 bg-brand-DEFAULT text-white font-bold text-sm rounded-xl hover:bg-brand-dark transition-all flex items-center gap-2 shadow-md active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4" /> Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isWorker = user.role === 'worker';
    const isEmployer = user.role === 'employer';
    const hasSigned = (isWorker && contract.workerSignature) || (isEmployer && contract.employerSignature);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-light text-brand-dark flex items-center justify-center rounded-xl">
                            <FileText className="w-5 h-5"/>
                        </div>
                        <div>
                            <h2 className="font-black text-lg text-slate-900 leading-tight">Digital Work Contract</h2>
                            <p className="text-xs text-slate-500 font-mono tracking-wider">ID: {contract.uniqueContractId}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center text-slate-600 transition-colors font-bold">
                            &times;
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 font-serif text-slate-800">
                    <div className="border-2 border-slate-900 p-8 rounded-lg relative bg-amber-50/10">

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold uppercase tracking-widest border-b border-slate-900 pb-4 inline-block px-12">Service Agreement</h3>
                        </div>

                        <p className="mb-4 leading-relaxed text-justify">
                            This agreement is officially registered on <strong>{new Date(contract.createdAt).toLocaleDateString()}</strong> between the Employer, <strong>{contract.employerName}</strong>, and the skilled professional Worker, <strong>{contract.workerName}</strong>.
                        </p>

                        <div className="bg-white border border-slate-200 p-6 rounded-lg my-6 shadow-sm font-sans text-sm">
                            <div className="grid grid-cols-2 gap-y-4">
                                <div><span className="text-slate-400 font-bold uppercase text-[10px]">Job Description</span><p className="font-bold text-slate-900">{contract.jobTitle}</p></div>
                                <div><span className="text-slate-400 font-bold uppercase text-[10px]">Location</span><p className="font-bold text-slate-900">{contract.workLocation}</p></div>
                                <div><span className="text-slate-400 font-bold uppercase text-[10px]">Agreed Wage</span><p className="font-bold text-brand-dark text-lg">₹{contract.wage} / Worker</p></div>
                                <div><span className="text-slate-400 font-bold uppercase text-[10px]">Disbursement Method</span><p className="font-bold text-slate-900">{contract.paymentMethod}</p></div>
                            </div>
                        </div>

                        <p className="leading-relaxed text-justify mb-8">
                            Both parties hereby agree to the terms of engagement and the total payout listed above. This digital contract acts as an immutable ledger transaction under the EverTried network.
                        </p>

                        {/* Signatures */}
                        <div className="grid grid-cols-2 gap-8 text-center text-sm font-sans mt-12">
                            <div>
                                <div className="border-b border-slate-400 pb-2 mb-2 min-h-[60px] flex flex-col justify-end items-center">
                                    {contract.employerSignature ? (
                                        <div className="text-green-600 flex flex-col items-center gap-1">
                                            <span className="font-serif italic text-2xl opacity-70">{contract.employerName}</span>
                                            <span className="text-[10px] font-mono bg-green-50 px-2 py-0.5 rounded border border-green-200">Hash: {contract.employerSignature.substring(0, 8)}...</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 italic">Awaiting Signature</span>
                                    )}
                                </div>
                                <p className="font-bold text-slate-600 uppercase tracking-wider text-xs">{contract.employerName}</p>
                                <p className="text-slate-400 text-[10px]">Employer</p>
                            </div>
                            <div>
                                <div className="border-b border-slate-400 pb-2 mb-2 min-h-[60px] flex flex-col justify-end items-center">
                                    {contract.workerSignature ? (
                                        <div className="text-green-600 flex flex-col items-center gap-1">
                                            <span className="font-serif italic text-2xl opacity-70">{contract.workerName}</span>
                                            <span className="text-[10px] font-mono bg-green-50 px-2 py-0.5 rounded border border-green-200">Hash: {contract.workerSignature.substring(0, 8)}...</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 italic">Awaiting Signature</span>
                                    )}
                                </div>
                                <p className="font-bold text-slate-600 uppercase tracking-wider text-xs">{contract.workerName}</p>
                                <p className="text-slate-400 text-[10px]">Worker</p>
                            </div>
                        </div>

                        {contract.status === 'accepted' && (
                            <div className="absolute -top-4 -right-4 rotate-12 bg-green-500 text-white font-black px-6 py-2 rounded shadow-lg border-2 border-white">
                                RATIFIED & ACTIVE
                            </div>
                        )}
                    </div>
                </div>

                {/* Sign Status Banner */}
                {signStatus && (
                    <div className={`mx-6 sm:mx-8 mb-3 p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 ${
                        signStatus.type === 'success'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            {signStatus.type === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <span>{signStatus.message}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSignStatus(null)}
                            className="p-1 hover:bg-black/5 rounded-lg text-slate-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-200 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-5 h-5 ${contract.status === 'accepted' ? 'text-green-500' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status: {contract.status}</span>
                    </div>

                    <div className="flex gap-3">
                        {!hasSigned ? (
                            <button
                                onClick={handleSign}
                                disabled={signing}
                                className="bg-brand-DEFAULT text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-dark transition-all active:scale-95 shadow-md shadow-brand-DEFAULT/20"
                            >
                                {signing
                                    ? <><div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div> Signing...</>
                                    : <><CheckCircle className="w-5 h-5"/> Sign & Accept Contract</>
                                }
                            </button>
                        ) : (
                            <button disabled className="bg-green-50 text-green-700 border border-green-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                                <CheckCircle className="w-4 h-4"/> You Signed This
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContractViewer;
