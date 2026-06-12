import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, AlertCircle, CheckCircle } from 'lucide-react';

export default function FileUpload({ onFileSelect, accept = 'image/*,application/pdf', maxFiles = 1 }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles && rejectedFiles.length > 0) {
      setError('Invalid file type or size exceeded. Please check file type.');
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: accept.split(',').reduce((acc, current) => {
      const [type, ext] = current.trim().split('/');
      acc[type] = acc[type] || [];
      if (ext) acc[type].push(ext === '*' ? [] : `.${ext}`);
      return acc;
    }, {})
  });

  return (
    <div style={{ width: '100%' }}>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed var(--border-glass)',
          borderRadius: '16px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: isDragActive ? 'rgba(14, 165, 233, 0.08)' : 'var(--bg-glass)',
          borderColor: isDragActive ? 'var(--color-primary)' : 'var(--border-glass)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        <input {...getInputProps()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <UploadCloud size={48} className={isDragActive ? 'text-sky-400' : 'text-slate-400'} style={{ transition: 'all 0.3s' }} />
          {isDragActive ? (
            <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Drop the medical file here...</p>
          ) : (
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                Drag and drop your report or medical image
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Supports PDF, PNG, JPG, JPEG up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && !error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            marginTop: '1rem',
          }}
        >
          <File size={20} className="text-emerald-400" />
          <div style={{ flexGrow: 1, overflow: 'hidden' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {selectedFile.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <CheckCircle size={20} className="text-emerald-400" />
        </div>
      )}
    </div>
  );
}
