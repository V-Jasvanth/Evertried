import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import WorkerDashboard from './pages/WorkerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import AuthPage from './pages/AuthPage';
import ErrorBoundary from './components/ErrorBoundary';

import ProfileOnboarding from './pages/ProfileOnboarding';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component to securely prevent unauthorized access
const ProtectedRoute = ({ children, allowedRole, checkOnboarding = true }) => {
    const { user } = useContext(AuthContext);
    
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    
    if (checkOnboarding && !user.profileCompleted) {
        return <Navigate to="/onboarding" replace />;
    }
    
    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={`/${user.role}`} replace />;
    }
    
    return children;
};

// Guest Route Component intercepts logged in users and forwards them to active dashboards
const GuestRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (user) {
        if (!user.profileCompleted) return <Navigate to="/onboarding" replace />;
        return <Navigate to={`/${user.role}`} replace />;
    }
    return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<GuestRoute><LandingPage /></GuestRoute>} />
        <Route path="auth" element={<GuestRoute><AuthPage /></GuestRoute>} />
        
        <Route path="onboarding" element={
            <ProtectedRoute allowedRole="" checkOnboarding={false}>
                <ProfileOnboarding />
            </ProtectedRoute>
        } />
        
        {/* Protected Dashboard Routes */}
        <Route path="worker" element={
            <ProtectedRoute allowedRole="worker">
                <ErrorBoundary><WorkerDashboard /></ErrorBoundary>
            </ProtectedRoute>
        } />
        
        <Route path="employer" element={
            <ProtectedRoute allowedRole="employer">
                <ErrorBoundary><EmployerDashboard /></ErrorBoundary>
            </ProtectedRoute>
        } />

        <Route path="coordinator" element={
            <ProtectedRoute allowedRole="coordinator">
                <ErrorBoundary><CoordinatorDashboard /></ErrorBoundary>
            </ProtectedRoute>
        } />

        <Route path="profile" element={
            <ProtectedRoute allowedRole="">
                <ErrorBoundary><ProfilePage /></ErrorBoundary>
            </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
