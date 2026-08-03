import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, CheckCircle, ShieldCheck } from 'lucide-react';

const ContractViewer = ({ contractId, onClose }) => {
    const { user } = useContext(AuthContext);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!contractId) return;
        const fetchContract = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_URL}/api/contract/${contractId}`, config);
                setContract(data);
            } catch (err) {
                console.error("Error fetching contract:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, [contractId, user, API_URL]);

    const handleSign = async () => {
        setSigning(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${API_URL}/api/contract/${contractId}/sign`, {}, config);
            setContract(data);
            alert("Digital Signature Applied Successfully!");
        } catch (err) {
            console.error("Signing failed", err);
            alert("Failed to sign contract. Ensure you have generated your profile signature first.");
        }
        setSigning(false);
    };

    if (loading) return (
        <div className="p-8 text-center">
            <div className="w-8 h-8 rounded-full border-4 border-brand-DEFAULT border-t-transparent animate-spin mx-auto"></div>
        </div>
    );

    if (!contract) return null;

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
