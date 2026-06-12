import React from 'react';

export default function LoadingSpinner({ size = 'medium', text = 'Analyzing...' }) {
  const spinnerSize = size === 'small' ? '24px' : size === 'large' ? '56px' : '40px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem 1rem' }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '4px solid var(--border-glass)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && (
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', margin: 0 }}>
          {text}
        </p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function SkeletonLoader({ rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', padding: '1rem 0' }}>
      <div className="skeleton" style={{ height: '24px', width: '40%' }} />
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{
            height: '16px',
            width: idx === rows - 1 ? '70%' : '100%'
          }}
        />
      ))}
    </div>
  );
}
