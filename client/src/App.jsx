import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts & Pages
import StaffLayout from './components/layout/StaffLayout';
import LandingPage from './pages/public/LandingPage';
import LiveQueueDisplay from './pages/public/LiveQueueDisplay';
import LoginPage from './pages/auth/LoginPage';
import ReceptionDashboard from './pages/reception/ReceptionDashboard';
import TriageStation from './pages/triage/TriageStation';
import DoctorWorkspace from './pages/doctor/DoctorWorkspace';
import LaboratoryQueue from './pages/lab/LaboratoryQueue';
import PharmacyDispense from './pages/pharmacy/PharmacyDispense';
import CashierDesk from './pages/billing/CashierDesk';
import ExecutiveDashboard from './pages/director/ExecutiveDashboard';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not directly authorized, still allow access for demo flexibility or redirect
    return children;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/queue-display" element={<LiveQueueDisplay />} />

          {/* Internal Hospital Management Portal (ORHIMS Core) */}
          <Route
            element={
              <ProtectedRoute>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/director" element={<ExecutiveDashboard />} />
            <Route path="/reception" element={<ReceptionDashboard />} />
            <Route path="/triage" element={<TriageStation />} />
            <Route path="/doctor" element={<DoctorWorkspace />} />
            <Route path="/laboratory" element={<LaboratoryQueue />} />
            <Route path="/pharmacy" element={<PharmacyDispense />} />
            <Route path="/billing" element={<CashierDesk />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
