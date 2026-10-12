import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  Database,
  Calendar,
  User,
  FileSpreadsheet,
  ArrowRight,
  UploadCloud,
  Layers,
  Sparkles,
} from 'lucide-react';

const Dashboard = () => {
  const [datasets, setDatasets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDatasets = useCallback(async (query = '') => {
    try {
      setLoading(true);
      setError('');
      const endpoint = query.trim()
        ? `/datasets?search=${encodeURIComponent(query.trim())}`
        : '/datasets';
      const res = await api.get(endpoint);
      if (res.data?.success) {
        setDatasets(res.data.datasets || []);
      }
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError('Failed to load datasets. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDatasets(searchQuery);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery, fetchDatasets]);

  const totalRowsCount = datasets.reduce((acc, curr) => acc + (curr.rowCount || 0), 0);

  return (
    <div>
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Climate Datasets Repository</h1>
          <p>
            Explore, analyze, and visualize environmental time-series and observations from global stations.
          </p>
        </div>

        <Link to="/upload" className="btn btn-primary">
          <UploadCloud size={18} />
          <span>Upload Dataset</span>
        </Link>
      </div>

      {/* Search and Metrics Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, description, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.45rem 0.9rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Database size={15} color="var(--primary)" />
            <span>{datasets.length} Datasets</span>
          </div>

          <div
            style={{
              padding: '0.45rem 0.9rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Layers size={15} color="var(--secondary)" />
            <span>{totalRowsCount.toLocaleString()} Total Records</span>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading climate datasets...</p>
        </div>
      ) : datasets.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-icon">
            <Database size={32} />
          </div>
          <h3>No Datasets Found</h3>
          <p>
            {searchQuery
              ? `No datasets matched "${searchQuery}". Try a different keyword.`
              : 'There are currently no climate datasets available. Be the first to upload one!'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          ) : (
            <Link to="/upload" className="btn btn-primary">
              <UploadCloud size={18} />
              <span>Upload CSV File</span>
            </Link>
          )}
        </div>
      ) : (
        /* Datasets Grid */
        <div className="datasets-grid">
          {datasets.map((ds) => {
            const dateStr = ds.createdAt
              ? new Date(ds.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <div key={ds._id} className="dataset-card">
                <div>
                  <div className="dataset-header">
                    <h2 className="dataset-title">{ds.title}</h2>
                    <span className="dataset-badge">
                      {ds.rowCount} {ds.rowCount === 1 ? 'row' : 'rows'}
                    </span>
                  </div>

                  <p className="dataset-desc">
                    {ds.description || 'No description provided for this dataset.'}
                  </p>

                  <div className="dataset-meta">
                    <div className="meta-item" title="File name">
                      <FileSpreadsheet size={15} />
                      <span className="font-mono">{ds.fileName}</span>
                    </div>

                    <div className="meta-item" title="Uploaded by">
                      <User size={15} />
                      <span>{ds.uploadedBy?.name || 'Anonymous'}</span>
                    </div>

                    <div className="meta-item" title="Upload date">
                      <Calendar size={15} />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {ds.columns && ds.columns.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--text-subtle)',
                          letterSpacing: '0.04em',
                          marginBottom: '0.4rem',
                        }}
                      >
                        Columns ({ds.columns.length})
                      </div>
                      <div className="dataset-columns-preview">
                        {ds.columns.slice(0, 5).map((col) => (
                          <span key={col} className="column-pill">
                            {col}
                          </span>
                        ))}
                        {ds.columns.length > 5 && (
                          <span className="column-pill">+{ds.columns.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="dataset-footer">
                  <Link to={`/datasets/${ds._id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                    <span>Explore & Analyze</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
