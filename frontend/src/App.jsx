import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import EmergencyBanner from './components/EmergencyBanner';

// Pages
import Landing from './pages/Landing';
import SymptomChecker from './pages/SymptomChecker';
import ReportAnalyzer from './pages/ReportAnalyzer';
import ImageAnalysis from './pages/ImageAnalysis';
import ChatAssistant from './pages/ChatAssistant';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Account from './pages/Account';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <EmergencyProvider>
          <AuthProvider>
            <Router>
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                
                {/* Global Emergency Notification Banner */}
                <EmergencyBanner />

                <div style={{ flexGrow: 1 }}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/symptom-checker" element={<SymptomChecker />} />
                    <Route path="/report-analyzer" element={<ReportAnalyzer />} />
                    <Route path="/image-analysis" element={<ImageAnalysis />} />
                    <Route path="/chat" element={<ChatAssistant />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/emergency" element={<Emergency />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/account" element={<Account />} />
                  </Routes>
                </div>
              </div>
            </Router>
          </AuthProvider>
        </EmergencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
