import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/public/LandingPage';
import Architecture from './pages/public/Architecture';
import CaseStudy from './pages/public/CaseStudy';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import ResumeAnalyzer from './pages/resume/ResumeAnalyzer';
import InterviewDashboard from './pages/interview/InterviewDashboard';
import CodingDashboard from './pages/coding/CodingDashboard';
import HiringReportDashboard from './pages/report/HiringReportDashboard';
import LearningRoadmap from './pages/roadmap/LearningRoadmap';
import CandidateSchedule from './pages/schedule/CandidateSchedule';
import RecruiterLayout from './components/layout/RecruiterLayout';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterPipeline from './pages/recruiter/RecruiterPipeline';
import RecruiterCreateJob from './pages/recruiter/RecruiterCreateJob';
import RecruiterCandidateView from './pages/recruiter/RecruiterCandidateView';
import RecruiterScheduling from './pages/recruiter/RecruiterScheduling';
import CopilotChat from './pages/copilot/CopilotChat';
import NotFound from './pages/error/NotFound';
import CommandPalette from './components/common/CommandPalette';

// Theme is managed directly in ThemeContext and user preferences.
// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role to avoid infinite loops
    if (user.role === 'recruiter') return <Navigate to="/recruiter" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="architecture" element={<Architecture />} />
          <Route path="case-study" element={<CaseStudy />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CandidateDashboard />} />
          <Route path="profile" element={<CandidateProfile />} />
          <Route path="resume" element={<ResumeAnalyzer />} />
          <Route path="schedule" element={<CandidateSchedule />} />
          <Route path="interview" element={<InterviewDashboard />} />
          <Route path="coding" element={<CodingDashboard />} />
          <Route path="report" element={<HiringReportDashboard />} />
          <Route path="roadmap" element={<LearningRoadmap />} />
          <Route path="copilot" element={<CopilotChat />} />
        </Route>

        {/* Recruiter Routes */}
        <Route 
          path="/recruiter" 
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RecruiterDashboard />} />
          <Route path="jobs/new" element={<RecruiterCreateJob />} />
          <Route path="jobs/:jobId/pipeline" element={<RecruiterPipeline />} />
          <Route path="jobs/:jobId/schedule/:appId" element={<RecruiterScheduling />} />
          <Route path="candidate/:appId" element={<RecruiterCandidateView />} />
          <Route path="copilot" element={<CopilotChat />} />
        </Route>

        {/* Error Routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <CommandPalette />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;