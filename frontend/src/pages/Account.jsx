import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Phone, Calendar, Droplets, Shield, LogOut,
  Edit3, Save, X, CheckCircle, Activity, FileText, Heart,
  AlertTriangle, Clock, Settings
} from 'lucide-react';

export default function Account() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    bloodGroup: user?.bloodGroup || '',
    allergies: user?.allergies || '',
    emergencyContact: user?.emergencyContact || '',
  });

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--gradient-hero)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '5rem 1rem',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center', maxWidth: 420,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div style={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.15))',
            border: '2px solid var(--border-glass)',
            borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem',
          }}>
            <User size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Sign In Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Create a free account or sign in to access your personalized health dashboard and settings.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/signup">
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                <User size={16} />
                Create Free Account
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const joinDate = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const age = user.dob
    ? Math.floor((Date.now() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const inputStyle = {
    width: '100%',
    background: 'rgba(14,165,233,0.04)',
    border: '1px solid var(--border-glass)',
    borderRadius: '10px',
    padding: '0.65rem 0.85rem',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-primary)',
    outline: 'none',
    transition: 'all 0.3s ease',
  };

  const statCard = (icon, label, value, color) => (
    <div style={{
      background: 'var(--bg-glass)',
      border: '1px solid var(--border-glass)',
      borderRadius: '14px',
      padding: '1rem',
      textAlign: 'center',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '10px',
        background: `${color}20`,
        border: `1px solid ${color}40`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '0.5rem',
      }}>
        {React.cloneElement(icon, { size: 18, style: { color } })}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '80px', maxWidth: '860px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>My Account</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/settings">
                <button className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Settings size={15} />
                  Settings
                </button>
              </Link>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Save Banner */}
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '12px', padding: '0.75rem 1rem',
                  color: '#10b981', fontSize: '0.9rem',
                }}
              >
                <CheckCircle size={17} />
                Profile updated successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Card */}
          <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--border-glass)',
                boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
                overflow: 'hidden',
              }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--bg-card)',
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.2rem' }}>{user.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} /> {user.email}
              </p>
              {user.phone && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} /> {user.phone}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {user.bloodGroup && (
                  <span style={{
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', borderRadius: '8px', padding: '0.2rem 0.6rem',
                    fontSize: '0.78rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                  }}>
                    <Droplets size={11} /> {user.bloodGroup}
                  </span>
                )}
                {age && (
                  <span style={{
                    background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
                    color: 'var(--color-primary)', borderRadius: '8px', padding: '0.2rem 0.6rem',
                    fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    {age} years
                  </span>
                )}
                <span style={{
                  background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                  color: 'var(--text-muted)', borderRadius: '8px', padding: '0.2rem 0.6rem',
                  fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}>
                  <Clock size={11} /> Joined {joinDate}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: editing ? 'rgba(239,68,68,0.1)' : 'var(--bg-glass)',
                border: `1px solid ${editing ? 'rgba(239,68,68,0.3)' : 'var(--border-glass)'}`,
                borderRadius: '10px',
                padding: '0.5rem 0.9rem',
                color: editing ? '#ef4444' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s',
              }}
            >
              {editing ? <X size={15} /> : <Edit3 size={15} />}
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            {statCard(<Activity />, 'Health Sessions', '—', '#0ea5e9')}
            {statCard(<FileText />, 'Reports Analyzed', '—', '#6366f1')}
            {statCard(<Heart />, 'Symptoms Checked', '—', '#ef4444')}
            {statCard(<Shield />, 'Privacy Score', '100%', '#10b981')}
          </div>

          {/* Edit Profile Form */}
          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: '0 0 0 1px rgba(14,165,233,0.1), var(--shadow-card)',
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Edit3 size={16} style={{ color: 'var(--color-primary)' }} />
                    Edit Profile
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {[
                      { name: 'name', label: 'Full Name', icon: <User size={14} />, type: 'text', placeholder: 'Your name' },
                      { name: 'phone', label: 'Phone', icon: <Phone size={14} />, type: 'tel', placeholder: '+91 98765 43210' },
                      { name: 'dob', label: 'Date of Birth', icon: <Calendar size={14} />, type: 'date', placeholder: '' },
                      { name: 'emergencyContact', label: 'Emergency Contact', icon: <AlertTriangle size={14} />, type: 'tel', placeholder: 'Emergency phone' },
                    ].map(field => (
                      <div key={field.name}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                          {field.icon} {field.label}
                        </label>
                        <input
                          id={`account-${field.name}`}
                          name={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={form[field.name]}
                          onChange={handleChange}
                          style={{ ...inputStyle, colorScheme: field.type === 'date' ? 'dark' : 'normal' }}
                          onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    ))}

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                        <Droplets size={14} /> Allergies / Conditions
                      </label>
                      <input
                        id="account-allergies"
                        name="allergies"
                        type="text"
                        placeholder="e.g. Penicillin, Peanuts"
                        value={form.allergies}
                        onChange={handleChange}
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                        <Droplets size={14} /> Blood Group
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                        {bloodGroups.map(bg => (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, bloodGroup: bg }))}
                            style={{
                              padding: '0.4rem 0.2rem',
                              borderRadius: '8px', border: '1px solid',
                              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                              transition: 'all 0.2s',
                              background: form.bloodGroup === bg ? 'linear-gradient(135deg, #ef4444, #f59e0b)' : 'var(--bg-glass)',
                              borderColor: form.bloodGroup === bg ? '#ef4444' : 'var(--border-glass)',
                              color: form.bloodGroup === bg ? 'white' : 'var(--text-secondary)',
                            }}
                          >
                            {bg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    id="account-save-btn"
                    onClick={handleSave}
                    className="btn-primary"
                    style={{ marginTop: '1.25rem', padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
                  >
                    <Save size={15} />
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Health Info Display */}
          {!editing && (user.allergies || user.emergencyContact || user.bloodGroup || user.dob) && (
            <div style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-glass)',
              borderRadius: '20px',
              padding: '1.75rem',
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={16} style={{ color: '#ef4444' }} />
                Health Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {user.dob && (
                  <div style={{ background: 'var(--bg-glass)', borderRadius: '12px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>DATE OF BIRTH</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(user.dob).toLocaleDateString('en-IN')}</div>
                  </div>
                )}
                {user.bloodGroup && (
                  <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>BLOOD GROUP</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444' }}>{user.bloodGroup}</div>
                  </div>
                )}
                {user.allergies && (
                  <div style={{ background: 'var(--bg-glass)', borderRadius: '12px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>ALLERGIES</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.allergies}</div>
                  </div>
                )}
                {user.emergencyContact && (
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>EMERGENCY CONTACT</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f59e0b' }}>{user.emergencyContact}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div style={{
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ef4444', marginBottom: '0.2rem' }}>Sign Out</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>You will be returned to the home page.</div>
            </div>
            <button
              id="account-logout-btn"
              onClick={handleLogout}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '0.55rem 1rem',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.2s',
              }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
