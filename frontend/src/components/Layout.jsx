import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, HardHat, Home, LogOut, User as UserIcon } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            {/* Premium Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-brand-DEFAULT rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-DEFAULT/30 group-hover:scale-105 transition-transform">
                                <span className="font-black text-xl tracking-tighter">ET</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-brand-DEFAULT transition-colors">
                                EverTried.
                            </span>
                        </Link>
                        
                        <nav className="flex items-center gap-6">
                            {!user && (
                                <Link 
                                    to="/" 
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-brand-DEFAULT' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    <Home className="w-4 h-4" /> Home
                                </Link>
                            )}

                            {!user ? (
                                <Link 
                                    to="/auth" 
                                    className="flex items-center gap-2 text-sm font-bold text-brand-DEFAULT bg-brand-light px-4 py-2 rounded-xl hover:bg-brand-DEFAULT hover:text-white transition-colors"
                                >
                                    <UserIcon className="w-4 h-4" /> Sign In
                                </Link>
                            ) : (
                                <>
                                    {user.role === 'worker' && (
                                        <Link 
                                            to="/worker" 
                                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/worker' ? 'text-brand-DEFAULT' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <HardHat className="w-4 h-4" /> Dashboard
                                        </Link>
                                    )}
                                    
                                    {user.role === 'employer' && (
                                        <Link 
                                            to="/employer" 
                                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/employer' ? 'text-brand-DEFAULT' : 'text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <Briefcase className="w-4 h-4" /> Dashboard
                                        </Link>
                                    )}

                                    <Link 
                                        to="/profile" 
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/profile' ? 'text-brand-DEFAULT' : 'text-slate-600 hover:text-slate-900'}`}
                                    >
                                        <UserIcon className="w-4 h-4" /> Profile
                                    </Link>

                                    <div className="h-6 w-[1px] bg-slate-200"></div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                                            {user.name}
                                        </div>
                                        <button 
                                            onClick={handleLogout}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                                            title="Logout"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-brand-DEFAULT rounded-lg flex items-center justify-center text-white">
                            <span className="font-black text-sm tracking-tighter">ET</span>
                        </div>
                        <span className="font-bold text-lg text-white">EverTried AI Engine</span>
                    </div>
                    <p className="text-sm max-w-md mx-auto leading-relaxed">
                        Eliminating middlemen. Connecting skilled labor directly with opportunity based on proximity, skills, and intelligent matching.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
