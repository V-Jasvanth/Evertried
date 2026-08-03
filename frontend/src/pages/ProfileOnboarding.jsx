import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, MapPin, HardHat, CheckCircle, ArrowRight, Mic, Map, DollarSign, Navigation, ArrowLeft } from 'lucide-react';

const ProfileOnboarding = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Form fields
    const [name, setName] = useState(user?.name || '');
    const [role, setRole] = useState(user?.role !== 'pending' ? user?.role : 'worker');
    
    // Worker specific
    const [primarySkill, setPrimarySkill] = useState('');
    const [wageExpectation, setWageExpectation] = useState('');
    const [workRadius, setWorkRadius] = useState(5);
    
    // Employer specific
    const [employerType, setEmployerType] = useState('Individual');
    
    // General
    const [locationName, setLocationName] = useState('');
    const [availability, setAvailability] = useState(true);

    const [isListeningAI, setIsListeningAI] = useState(false);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const mockVoiceInput = () => {
        setIsListeningAI(true);
        setTimeout(() => {
            if (step === 1) setName('Rajesh Kumar');
            if (step === 2 && role === 'worker') { setPrimarySkill('Plumber'); setWageExpectation('800'); }
            setIsListeningAI(false);
        }, 2000);
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            const data = {
                name, role, locationName, availability,
                ...(role === 'worker' ? { primarySkill, wageExpectation: Number(wageExpectation), workRadius } : { employerType })
            };
            
            const updatedUser = await updateProfile(data);
            navigate(`/${updatedUser.role}`);
        } catch(error) {
            console.error('Failed to update profile', error);
        }
        setLoading(false);
    };

    const detectLocation = () => {
        setLocationName('Detecting...');
        setTimeout(() => setLocationName('Connaught Place, New Delhi'), 1500); // Mock GPS
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 py-8 max-w-lg mx-auto w-full">
            
            {/* Progress Bar */}
            <div className="w-full flex gap-2 mb-8 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-2.5 flex-1 rounded-full ${step >= s ? 'bg-brand-DEFAULT' : 'bg-slate-200'}`} />
                ))}
            </div>

            <div className="bg-white w-full rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 transform transition-all relative overflow-hidden">
                {/* Voice Assistant Button (Accessible anywhere) */}
                <button 
                    onClick={mockVoiceInput} 
                    className={`absolute top-6 right-6 p-3 rounded-full shadow-md cursor-pointer transition-all ${isListeningAI ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-brand-light text-brand-dark hover:scale-105'}`}
                >
                    <Mic className="w-5 h-5" />
                </button>

                {step === 1 && (
                    <div className="animate-in slide-in-from-right-4">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Who are you?</h2>
                        <p className="text-slate-500 font-medium mb-8">Let's set up your profile.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block font-bold text-slate-700 mb-3 text-lg">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold outline-none focus:border-brand-DEFAULT bg-slate-50"
                                    value={name} onChange={e => setName(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-3 text-lg">I want to...</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setRole('worker')}
                                        className={`flex flex-col items-center p-6 rounded-2xl border-4 transition-all cursor-pointer ${role === 'worker' ? 'border-brand-DEFAULT bg-brand-light' : 'border-slate-100 bg-white'}`}
                                    >
                                        <HardHat className={`w-12 h-12 mb-2 ${role === 'worker' ? 'text-brand-dark' : 'text-slate-400'}`} />
                                        <span className={`font-black text-lg ${role === 'worker' ? 'text-brand-dark' : 'text-slate-500'}`}>Find Work</span>
                                    </button>
                                    <button 
                                        onClick={() => setRole('employer')}
                                        className={`flex flex-col items-center p-6 rounded-2xl border-4 transition-all cursor-pointer ${role === 'employer' ? 'border-brand-DEFAULT bg-brand-light' : 'border-slate-100 bg-white'}`}
                                    >
                                        <Briefcase className={`w-12 h-12 mb-2 ${role === 'employer' ? 'text-brand-dark' : 'text-slate-400'}`} />
                                        <span className={`font-black text-lg ${role === 'employer' ? 'text-brand-dark' : 'text-slate-500'}`}>Hire Workers</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && role === 'worker' && (
                    <div className="animate-in slide-in-from-right-4">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Your Work</h2>
                        <p className="text-slate-500 font-medium mb-8">What do you do?</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block font-bold text-slate-700 mb-3 text-lg">Primary Skill</label>
                                <select 
                                    className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold outline-none focus:border-brand-DEFAULT bg-slate-50"
                                    value={primarySkill} onChange={e => setPrimarySkill(e.target.value)}
                                >
                                    <option value="">Select a skill...</option>
                                    <option value="Plumber">Plumber</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Carpenter">Carpenter</option>
                                    <option value="Mason">Mason</option>
                                    <option value="Painter">Painter</option>
                                    <option value="Laborer">General Laborer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-3 text-lg flex items-center gap-2"><DollarSign className="w-5 h-5"/> Daily Wage (₹)</label>
                                <input 
                                    type="number" 
                                    className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-2xl font-black outline-none focus:border-brand-DEFAULT bg-slate-50"
                                    value={wageExpectation} onChange={e => setWageExpectation(e.target.value)}
                                    placeholder="e.g. 800"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-3 text-lg flex items-center gap-2"><Map className="w-5 h-5"/> Travel Distance</label>
                                <div className="flex bg-slate-100 p-2 rounded-2xl gap-2">
                                    {[1, 3, 5, 10].map(rad => (
                                        <button 
                                            key={rad} onClick={() => setWorkRadius(rad)}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all cursor-pointer ${workRadius === rad ? 'bg-white shadow-md text-brand-dark' : 'text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {rad}km
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && role === 'employer' && (
                    <div className="animate-in slide-in-from-right-4">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Employer Type</h2>
                        <p className="text-slate-500 font-medium mb-8">How do you operate?</p>

                        <div className="space-y-4">
                            <button onClick={() => setEmployerType('Individual')} className={`w-full flex items-center p-6 border-4 rounded-2xl cursor-pointer transition-all ${employerType === 'Individual' ? 'border-brand-DEFAULT bg-brand-light' : 'border-slate-100 bg-white'}`}>
                                <User className={`w-10 h-10 mr-4 ${employerType === 'Individual' ? 'text-brand-dark' : 'text-slate-400'}`}/>
                                <div className="text-left">
                                    <h3 className={`font-black text-xl ${employerType === 'Individual' ? 'text-brand-dark' : 'text-slate-700'}`}>Individual / Homeowner</h3>
                                    <p className="text-sm text-slate-500 font-medium">Hiring for a personal task</p>
                                </div>
                            </button>
                            <button onClick={() => setEmployerType('Contractor')} className={`w-full flex items-center p-6 border-4 rounded-2xl cursor-pointer transition-all ${employerType === 'Contractor' ? 'border-brand-DEFAULT bg-brand-light' : 'border-slate-100 bg-white'}`}>
                                <HardHat className={`w-10 h-10 mr-4 ${employerType === 'Contractor' ? 'text-brand-dark' : 'text-slate-400'}`}/>
                                <div className="text-left">
                                    <h3 className={`font-black text-xl ${employerType === 'Contractor' ? 'text-brand-dark' : 'text-slate-700'}`}>Contractor / Builder</h3>
                                    <p className="text-sm text-slate-500 font-medium">Hiring multiple workers regularly</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in slide-in-from-right-4">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Location</h2>
                        <p className="text-slate-500 font-medium mb-8">Where are you right now?</p>

                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-center">
                                <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Navigation className="w-8 h-8" />
                                </div>
                                <button onClick={detectLocation} className="bg-brand-DEFAULT text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-brand-dark transition-all flex items-center gap-2 mx-auto cursor-pointer">
                                    <MapPin className="w-5 h-5"/> Auto Detect Location
                                </button>
                                <input 
                                    type="text" 
                                    className="mt-6 w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-center text-slate-700 focus:border-brand-DEFAULT outline-none"
                                    placeholder="Or type explicitly"
                                    value={locationName} onChange={e => setLocationName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-3 text-lg">Are you available today?</label>
                                <div className="flex bg-slate-100 p-2 rounded-2xl gap-2">
                                    <button 
                                        onClick={() => setAvailability(true)}
                                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all cursor-pointer ${availability === true ? 'bg-green-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        Yes!
                                    </button>
                                    <button 
                                        onClick={() => setAvailability(false)}
                                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all cursor-pointer ${availability === false ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="mt-12 flex gap-4 pt-6 border-t border-slate-100">
                    {step > 1 && (
                        <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-slate-200 cursor-pointer text-lg">
                            <ArrowLeft className="w-6 h-6"/> Back
                        </button>
                    )}
                    
                    {step < 3 ? (
                        <button 
                            disabled={!name && step === 1}
                            onClick={handleNext} 
                            className="flex-[2] bg-slate-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-xl text-lg"
                        >
                            Next <ArrowRight className="w-6 h-6"/>
                        </button>
                    ) : (
                        <button 
                            onClick={handleFinish} disabled={loading}
                            className="flex-[2] bg-brand-DEFAULT text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-brand-dark cursor-pointer shadow-xl text-lg disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : <><CheckCircle className="w-6 h-6"/> Go to Dashboard</>}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ProfileOnboarding;
