import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User, Mail, Phone, Calendar, Droplets, Shield, LogOut,
  Edit3, Save, X, CheckCircle, Activity, FileText, Heart,
  AlertTriangle, Clock, Settings, Lock, Eye, EyeOff, Trash2
} from 'lucide-react';

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Tigger',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Buster'
];

export default function Account() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const { t } = useLanguage();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  
  // Password change state
  const [showPass, setShowPass] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');

  // Delete account confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    bloodGroup: user?.bloodGroup || '',
    allergies: user?.allergies || '',
    emergencyContact: user?.emergencyContact || '',
    avatar: user?.avatar || AVATARS[0]
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    setSaved(true);
    setError('');
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPass || !passwordForm.newPass || !passwordForm.confirmPass) {
      setPasswordMessage('Please fill all password fields.');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    // Verify current password (mock check for demo)
    updateProfile({ password: passwordForm.newPass });
    setPasswordMessage('Password updated successfully!');
    setPasswordForm({ currentPass: '', newPass: '', confirmPass: '' });
    setTimeout(() => setPasswordMessage(''), 2500);
  };

  const handleDeleteAccountConfirm = () => {
    deleteAccount();
    setShowDeleteModal(false);
    navigate('/');
  };

  const joinDate = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const age = user.dob
    ? Math.floor((Date.now() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="page-wrapper">
      <div className="section-container" style={{ paddingBottom: '5rem', maxWidth: '840px' }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h1 className="page-heading" style={{ margin: 0 }}>User Profile</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link to="/settings" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  <Settings size={14} />
                  Settings
                </button>
              </Link>
              <button onClick={() => logout()} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', color: 'var(--color-rose)', borderColor: 'rgba(244,63,94,0.2)' }}>
                <LogOut size={14} />
                {t('signOut')}
              </button>
            </div>
          </div>

          {/* Success Banner */}
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
                  color: '#10b981', fontSize: '0.85rem',
                }}
              >
                <CheckCircle size={15} />
                Profile updated successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Overview Card */}
          <div className="glass-card" style={{
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            flexWrap: 'wrap', padding: '2rem'
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 84, height: 84, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--border-glass)',
                boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
                overflow: 'hidden',
              }}>
                <img src={form.avatar} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 18, height: 18, borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--bg-surface)',
              }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>{user.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} style={{ color: 'var(--color-primary)' }} /> {user.email}
              </p>
              {user.phone && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={13} style={{ color: 'var(--color-accent)' }} /> {user.phone}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                {user.bloodGroup && (
                  <span style={{
                    background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
                    color: 'var(--color-rose)', borderRadius: '8px', padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                  }}>
                    <Droplets size={11} /> {user.bloodGroup}
                  </span>
                )}
                {age && (
                  <span style={{
                    background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
                    color: 'var(--color-primary)', borderRadius: '8px', padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {age} years
                  </span>
                )}
                <span style={{
                  background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)', borderRadius: '8px', padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}>
                  <Clock size={11} /> Joined {joinDate}
                </span>
              </div>
            </div>

            {/* Edit Trigger */}
            <button
              onClick={() => setEditing(!editing)}
              className="btn-ghost"
              style={{
                borderColor: editing ? 'var(--color-rose)' : 'var(--border-glass)',
                color: editing ? 'var(--color-rose)' : 'var(--text-secondary)',
                alignSelf: 'flex-start'
              }}
            >
              {editing ? <X size={14} /> : <Edit3 size={14} />}
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Form Expansion */}
          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="glass-card" style={{ borderColor: 'var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Edit3 size={15} style={{ color: 'var(--color-primary)' }} />
                    Edit Profile Details
                  </h4>

                  {/* Avatar Picker */}
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Choose Avatar Profile Picture
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, avatar: av }))}
                          style={{
                            width: 54, height: 54, borderRadius: '50%',
                            padding: 2, cursor: 'pointer', overflow: 'hidden',
                            background: form.avatar === av ? 'var(--color-primary)' : 'var(--bg-glass)',
                            border: form.avatar === av ? '3px solid var(--color-primary)' : '1px solid var(--border-glass)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <img src={av} alt={`Avatar ${idx}`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
                    {[
                      { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter name' },
                      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
                      { name: 'dob', label: 'Date of Birth', type: 'date', placeholder: '' },
                      { name: 'emergencyContact', label: 'Emergency Contact', type: 'tel', placeholder: 'Contact phone' },
                    ].map(field => (
                      <div key={field.name}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {field.label}
                        </label>
                        <input
                          id={`account-${field.name}`}
                          name={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={form[field.name]}
                          onChange={handleChange}
                          className="input-field"
                          style={{ colorScheme: field.type === 'date' ? 'dark' : 'normal' }}
                        />
                      </div>
                    ))}

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Allergies &amp; Conditions
                      </label>
                      <input
                        id="account-allergies"
                        name="allergies"
                        type="text"
                        placeholder="e.g. Penicillin, Pollen, Asthmatic"
                        value={form.allergies}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Blood Group
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                        {bloodGroups.map(bg => (
                          <button
                            key={bg}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, bloodGroup: bg }))}
                            style={{
                              padding: '0.45rem 0.2rem',
                              borderRadius: '8px', border: '1px solid',
                              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
                              transition: 'all 0.2s',
                              background: form.bloodGroup === bg ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                              borderColor: form.bloodGroup === bg ? 'var(--color-primary)' : 'var(--border-glass)',
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
                    style={{ marginTop: '0.5rem', height: 40, alignSelf: 'flex-start' }}
                  >
                    <Save size={14} />
                    Save Details
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Health Info Display Panel */}
          {!editing && (user.allergies || user.emergencyContact || user.bloodGroup || user.dob) && (
            <div className="glass-card">
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={15} style={{ color: 'var(--color-rose)' }} />
                Saved Health Parameters
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {user.dob && (
                  <div style={{ background: 'var(--bg-glass)', borderRadius: '12px', padding: '0.875rem', border: '1px solid var(--border-glass)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem' }}>DATE OF BIRTH</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{new Date(user.dob).toLocaleDateString('en-IN')}</div>
                  </div>
                )}
                {user.bloodGroup && (
                  <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: '12px', padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem' }}>BLOOD GROUP</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-rose)' }}>{user.bloodGroup}</div>
                  </div>
                )}
                {user.allergies && (
                  <div style={{ background: 'var(--bg-glass)', borderRadius: '12px', padding: '0.875rem', border: '1px solid var(--border-glass)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem' }}>KNOWN ALLERGIES</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.allergies}</div>
                  </div>
                )}
                {user.emergencyContact && (
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px', padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.25rem' }}>EMERGENCY PHONE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-amber)' }}>{user.emergencyContact}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Change Password Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={15} style={{ color: 'var(--color-accent)' }} />
              Change Password Settings
            </h4>

            {passwordMessage && (
              <div style={{
                fontSize: '0.8rem', padding: '0.6rem 0.85rem', borderRadius: '10px',
                background: passwordMessage.includes('successfully') ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                color: passwordMessage.includes('successfully') ? 'var(--color-emerald)' : 'var(--color-rose)',
                border: passwordMessage.includes('successfully') ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(244,63,94,0.2)'
              }}>
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>CURRENT PASSWORD</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passwordForm.currentPass}
                    onChange={e => setPasswordForm(p => ({ ...p, currentPass: e.target.value }))}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>NEW PASSWORD</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passwordForm.newPass}
                    onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>CONFIRM NEW PASSWORD</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passwordForm.confirmPass}
                    onChange={e => setPasswordForm(p => ({ ...p, confirmPass: e.target.value }))}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem',
                    fontSize: '0.78rem', fontWeight: 600
                  }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPass ? 'Hide passwords' : 'Show passwords'}</span>
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem', height: 36 }}>
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="glass-card" style={{ borderColor: 'rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--color-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={16} /> Danger Zone
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Deletes your user account, stored clinical history, credentials, and settings permanently from this browser. This action is irreversible.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-ghost"
              style={{
                alignSelf: 'flex-start',
                borderColor: 'var(--color-rose)',
                color: 'var(--color-rose)',
                background: 'rgba(244,63,94,0.04)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.04)'}
            >
              Delete Account Permanently
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem', background: 'rgba(6,11,20,0.65)', backdropFilter: 'blur(8px)'
              }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card"
                  style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center', borderColor: 'var(--color-rose)' }}
                >
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: 'rgba(244,63,94,0.15)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem'
                  }}>
                    <AlertTriangle size={24} style={{ color: 'var(--color-rose)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Are you absolutely sure?</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    This will delete your medical advisor profiles and completely purge all diagnostic summaries from this browser. This cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                    <button
                      onClick={handleDeleteAccountConfirm}
                      className="btn-primary"
                      style={{ background: 'linear-gradient(135deg, #f43f5e, #ef4444)', border: 'none' }}
                    >
                      Yes, Delete Account
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
