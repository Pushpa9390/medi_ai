import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { AuthProvider } from './context/AuthContext';
import SidebarNav from './components/SidebarNav';
import EmergencyBanner from './components/EmergencyBanner';
import HeaderProfile from './components/HeaderProfile';

// Pages
import Landing from './pages/Landing';
import SymptomChecker from './pages/SymptomChecker';
import ReportAnalyzer from './pages/ReportAnalyzer';
import ImageAnalysis from './pages/ImageAnalysis';
import ChatAssistant from './pages/ChatAssistant';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import Settings from './pages/Settings';
import Account from './pages/Account';
import MyRecords from './pages/MyRecords';

function AppShell() {
  return (
    <div className="app-shell">
      <SidebarNav />

      <main className="main-content">
        {/* Floating Top-Right Profile / Auth Widget */}
        <HeaderProfile />

        {/* Global Emergency Notification Banner */}
        <EmergencyBanner />

        <Routes>
          <Route path="/"                element={<Landing />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/report-analyzer" element={<ReportAnalyzer />} />
          <Route path="/image-analysis"  element={<ImageAnalysis />} />
          <Route path="/chat"            element={<ChatAssistant />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/emergency"       element={<Emergency />} />
          <Route path="/settings"        element={<Settings />} />
          <Route path="/account"         element={<Account />} />
          <Route path="/records"         element={<MyRecords />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <EmergencyProvider>
          <AuthProvider>
            <Router>
              <AppShell />
            </Router>
          </AuthProvider>
        </EmergencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
