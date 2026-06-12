import React, { createContext, useContext, useState, useCallback } from 'react';

const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'stroke', 'can\'t breathe', 'not breathing',
  'severe bleeding', 'unconscious', 'loss of consciousness', 'fainted',
  'severe headache', 'sudden numbness', 'face drooping', 'arm weakness',
  'speech difficulty', 'choking', 'overdose', 'seizure', 'anaphylaxis',
  'allergic reaction', 'severe burns', 'suicide', 'self harm',
  // Telugu
  'ఛాతి నొప్పి', 'శ్వాస తీసుకోలేకపోతున్నాను',
  // Hindi
  'सीने में दर्द', 'सांस नहीं आ रही',
];

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');

  const checkForEmergency = useCallback((text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    const found = EMERGENCY_KEYWORDS.find(kw => lowerText.includes(kw.toLowerCase()));
    if (found) {
      setIsEmergency(true);
      setEmergencyMessage(
        `⚠️ EMERGENCY DETECTED: "${found}" — Please call emergency services immediately!`
      );
      return true;
    }
    return false;
  }, []);

  const clearEmergency = useCallback(() => {
    setIsEmergency(false);
    setEmergencyMessage('');
  }, []);

  return (
    <EmergencyContext.Provider value={{ isEmergency, emergencyMessage, checkForEmergency, clearEmergency }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergency must be used within EmergencyProvider');
  return ctx;
};
