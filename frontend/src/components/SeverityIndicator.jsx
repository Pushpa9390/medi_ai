import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function SeverityIndicator({ level = 'low', label = '' }) {
  const normalizedLevel = level.toLowerCase();
  
  let colorClass = 'severity-low';
  let levelName = 'Low / Mild';
  let description = 'Symptoms can likely be monitored at home. If symptoms persist or worsen, please consult a healthcare provider.';

  if (normalizedLevel === 'medium' || normalizedLevel === 'moderate') {
    colorClass = 'severity-medium';
    levelName = 'Moderate';
    description = 'Symptoms warrant attention. Consider scheduling a consultation with your family doctor.';
  } else if (normalizedLevel === 'high') {
    colorClass = 'severity-high';
    levelName = 'High';
    description = 'Significant symptoms. Contact a medical clinic or seek urgent care advice promptly.';
  } else if (normalizedLevel === 'critical' || normalizedLevel === 'severe') {
    colorClass = 'severity-critical';
    levelName = 'Critical Emergency';
    description = 'Severe symptoms requiring immediate emergency services. Call 112 / 911 or head to the nearest ER.';
  }

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}
      className={colorClass}
    >
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
          {label || `Severity: ${levelName}`}
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
          {description}
        </div>
      </div>
    </div>
  );
}
