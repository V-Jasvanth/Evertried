import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PenTool, CheckCircle, ShieldCheck } from 'lucide-react';

const DigitalSignature = () => {
    const { user } = useContext(AuthContext);
    const [fullName, setFullName] = useState('');
    const [signature, setSignature] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchSignature = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_URL}/api/user/get-signature`, config);
                if (data.signature) {
                    setSignature(data.signature);
                }
            } catch (error) {
                console.log('No existing signature found');
            }
        };
        fetchSignature();
    }, [user, API_URL]);

    const handlePreview = (e) => {
        e.preventDefault();
        if (fullName.trim().length < 3) return alert('Please enter your full legal name');
        setPreview(true);
    };

    const handleSavePrimary = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${API_URL}/api/user/create-signature`, { fullName }, config);
            setSignature(data.signature);
            setPreview(false);
        } catch (error) {
            console.error('Failed to create signature', error);
            alert('Failed to generate signature');
        }
        setLoading(false);
    };

    if (signature) {
        return (
            <div className="bg-white border rounded-2xl p-6 shadow-sm border-slate-200 w-full max-w-sm">
                <div className="flex items-center gap-2 mb-4 text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-bold">Verified Signature</h3>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-serif italic text-2xl text-slate-800 text-center">
                    {signature.signedBy}
                </div>
                <div className="mt-4 text-xs text-slate-400 font-mono tracking-tighter break-all bg-slate-100 p-2 rounded">
                    <p><strong>Hash:</strong> {signature.hashId}</p>
                    <p><strong>Date:</strong> {new Date(signature.timestamp).toLocaleString()}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-2xl p-6 shadow-sm border-slate-200 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
                <PenTool className="w-5 h-5" />
                <h3 className="font-bold">Digital Signature</h3>
            </div>
            
            {!preview ? (
                <form onSubmit={handlePreview}>
                    <p className="text-sm text-slate-500 mb-4">Type your full legal name below to generate an immutable digital signature for job contracts.</p>
                    <input 
                        type="text" 
                        required
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 mb-4 outline-none focus:border-brand-DEFAULT transition-all font-semibold"
                        placeholder="e.g. John R. Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold hover:bg-slate-800 transition-all">
                        Preview Signature
                    </button>
                </form>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-sm text-slate-500 mb-2 font-bold uppercase tracking-wider text-center">Preview</p>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-6 rounded-xl font-serif italic text-3xl text-slate-800 text-center mb-6">
                        {fullName}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setPreview(false)} className="flex-1 bg-slate-100 text-slate-600 rounded-xl py-3 font-bold hover:bg-slate-200 transition-all">
                            Edit
                        </button>
                        <button 
                            onClick={handleSavePrimary}
                            disabled={loading}
                            className="flex-[2] bg-brand-DEFAULT text-white rounded-xl py-3 font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Saving...' : <><CheckCircle className="w-5 h-5" /> Confirm & Save</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DigitalSignature;
