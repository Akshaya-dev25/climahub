import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle2,
  Leaf,
} from 'lucide-react';

const Upload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV (.csv) format datasets are currently accepted for statistical processing.');
      return;
    }
    setError('');
    setFile(selectedFile);
    if (!title.trim()) {
      const cleanName = selectedFile.name
        .replace(/\.csv$/i, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(cleanName);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a descriptive title for this climate dataset.');
      return;
    }

    if (!file) {
      setError('Please select or drag a CSV file to ingest.');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('file', file);

      const res = await api.post('/datasets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success && res.data?.dataset?._id) {
        navigate(`/datasets/${res.data.dataset._id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.message || err.message || 'Dataset upload failed. Please verify CSV encoding.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="detail-top-nav-wrap">
        <Link to="/" className="back-link-stylish">
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: 'linear-gradient(90deg, var(--forest-700), var(--ocean-600), var(--sky-500))',
          }}
        />

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--forest-700)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            <Leaf size={16} />
            <span>Open Research Ingestion</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--forest-900)', letterSpacing: '-0.03em' }}>
            Contribute Climate Dataset
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.975rem', marginTop: '0.35rem' }}>
            Deposit sensor measurements, meteorological observations, or environmental timeseries in UTF-8 CSV format.
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-error" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group-modern">
            <label className="form-label-modern" htmlFor="upload-title">
              Dataset Title <span style={{ color: 'var(--coral-600)' }}>*</span>
            </label>
            <input
              id="upload-title"
              type="text"
              className="form-input-modern"
              placeholder="e.g. Alpine Weather Stations 2026 Observations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group-modern">
            <label className="form-label-modern" htmlFor="upload-desc">
              Description & Methodology Notes (Optional)
            </label>
            <textarea
              id="upload-desc"
              className="form-input-modern"
              rows={3}
              placeholder="Provide background on instruments, geographic coordinates, units (e.g. °C, mm, ppm), or university laboratory..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group-modern">
            <label className="form-label-modern">
              CSV Dataset File <span style={{ color: 'var(--coral-600)' }}>*</span>
            </label>

            {!file ? (
              <div
                style={{
                  border: isDragging ? '2px dashed var(--ocean-600)' : '2px dashed var(--border-card)',
                  backgroundColor: isDragging ? 'var(--ocean-50)' : 'var(--sand-50)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".csv"
                  onChange={handleFileChange}
                />
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    background: 'var(--ocean-100)',
                    color: 'var(--ocean-700)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <UploadCloud size={28} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--forest-900)' }}>
                  Click to select or drop CSV dataset here
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Accepts comma-separated values (.csv) with numeric headers (temperature, rainfall, CO2)
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--sand-50)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <FileSpreadsheet size={32} color="var(--forest-700)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--forest-900)' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(file.size / 1024).toFixed(1)} KB • CSV Format
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Remove file"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <>
                  <div className="spinner-loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span>Parsing Columns & Statistics...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>Upload & Ingest Dataset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
