import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Users,
  CloudSun,
  Thermometer,
  Wind,
  Droplets,
  Waves,
  Globe,
  Sparkles,
  X,
} from 'lucide-react';

const STRIP_CLASSES = ['strip-forest', 'strip-ocean', 'strip-sky', 'strip-amber'];
const BUBBLE_CLASSES = ['bubble-forest', 'bubble-ocean', 'bubble-sky', 'bubble-amber'];
const ICONS = [CloudSun, Thermometer, Wind, Droplets, Waves, Globe];

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
      setError('Unable to reach the backend service. Please verify the server is running on port 5000.');
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
    }, 320);

    return () => clearTimeout(handler);
  }, [searchQuery, fetchDatasets]);

  // Real-data metrics calculations
  const totalDatasetsCount = datasets.length;
  const totalObservationsCount = useMemo(() => {
    return datasets.reduce((sum, d) => sum + (d.rowCount || 0), 0);
  }, [datasets]);

  const uniqueContributorsCount = useMemo(() => {
    const contributors = new Set();
    datasets.forEach((d) => {
      const id = d.uploadedBy?._id || d.uploadedBy?.email || d.uploadedBy?.name;
      if (id) contributors.add(id);
    });
    return contributors.size || (datasets.length > 0 ? 1 : 0);
  }, [datasets]);

  return (
    <div>
      {/* 1. HERO / LANDING BANNER WITH REAL-DATA STAT CARDS */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-text-row">
            <div>
              <div className="hero-badge-pill">
                <Sparkles size={14} />
                <span>Open Science & Climate Intelligence</span>
              </div>
              <h1 className="hero-headline">Centralized Climate Research Data</h1>
              <p className="hero-tagline">
                Access curated meteorological observations, greenhouse gas fluxes, and environmental
                sensor networks aggregated from university labs across the globe.
              </p>
            </div>

            <div>
              <Link to="/upload" className="btn btn-hero-action">
                <UploadCloud size={18} />
                <span>Upload New Dataset</span>
              </Link>
            </div>
          </div>

          {/* 3 Real-data Stat Cards */}
          <div className="hero-stats-row">
            <div className="hero-stat-card">
              <div className="hero-stat-icon-wrap">
                <Database size={22} />
              </div>
              <div>
                <div className="hero-stat-num">{totalDatasetsCount}</div>
                <div className="hero-stat-label">Published Datasets</div>
              </div>
            </div>

            <div className="hero-stat-card">
              <div className="hero-stat-icon-wrap">
                <Layers size={22} />
              </div>
              <div>
                <div className="hero-stat-num">{totalObservationsCount.toLocaleString()}</div>
                <div className="hero-stat-label">Observations Analyzed</div>
              </div>
            </div>

            <div className="hero-stat-card">
              <div className="hero-stat-icon-wrap">
                <Users size={22} />
              </div>
              <div>
                <div className="hero-stat-num">{uniqueContributorsCount}</div>
                <div className="hero-stat-label">Active Contributors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & CONTROLS BAR */}
      <div className="controls-bar">
        <div className="search-field-wrapper">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            className="search-field-input"
            placeholder="Search datasets by title, climate variables, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                color: 'var(--text-muted)',
                padding: '4px',
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="results-meta-pill">
          <Database size={15} color="var(--forest-700)" />
          <span>
            {loading ? 'Searching...' : `${datasets.length} ${datasets.length === 1 ? 'Dataset' : 'Datasets'} Found`}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert-banner alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* 3. LOADING SKELETONS */}
      {loading ? (
        <div className="datasets-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }}></div>
                <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 999 }}></div>
              </div>
              <div className="skeleton" style={{ width: '85%', height: 26, marginTop: 8 }}></div>
              <div className="skeleton" style={{ width: '100%', height: 42 }}></div>
              <div className="skeleton" style={{ width: '100%', height: 20, marginTop: 'auto' }}></div>
              <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8 }}></div>
            </div>
          ))}
        </div>
      ) : datasets.length === 0 ? (
        /* 4. FRIENDLY EMPTY STATE */
        <div className="empty-state-friendly">
          <div className="empty-icon-circle">
            <Globe size={36} />
          </div>
          <h2 className="empty-title">
            {searchQuery ? 'No matching climate records found' : 'No datasets uploaded yet'}
          </h2>
          <p className="empty-desc">
            {searchQuery
              ? `We couldn't find any datasets matching "${searchQuery}". Try searching for keywords like temperature, CO2, rainfall, or location.`
              : 'Be the first researcher to contribute time-series measurements or station data to the ClimaHub repository.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchQuery('')}
            >
              Clear Filter
            </button>
          ) : (
            <Link to="/upload" className="btn btn-primary">
              <UploadCloud size={18} />
              <span>Upload Sample Dataset</span>
            </Link>
          )}
        </div>
      ) : (
        /* 5. DATASET CARDS GRID (Rounded, Colored Strip, Lift on Hover) */
        <div className="datasets-grid">
          {datasets.map((ds, idx) => {
            const stripClass = STRIP_CLASSES[idx % STRIP_CLASSES.length];
            const bubbleClass = BUBBLE_CLASSES[idx % BUBBLE_CLASSES.length];
            const IconComponent = ICONS[idx % ICONS.length];

            const dateStr = ds.createdAt
              ? new Date(ds.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            return (
              <div key={ds._id} className="dataset-card-polished">
                {/* Colored Top Accent Strip */}
                <div className={`card-accent-strip ${stripClass}`} />

                <div className="card-inner-body">
                  <div className="card-top-row">
                    <div className={`card-icon-bubble ${bubbleClass}`}>
                      <IconComponent size={22} />
                    </div>
                    <span className="card-obs-badge">
                      {(ds.rowCount || 0).toLocaleString()} {ds.rowCount === 1 ? 'row' : 'rows'}
                    </span>
                  </div>

                  <h2 className="card-dataset-title">{ds.title}</h2>
                  <p className="card-dataset-desc">
                    {ds.description || 'Verified environmental research dataset without supplementary summary notes.'}
                  </p>

                  <div className="card-metadata-grid">
                    <div className="meta-token" title="Origin file">
                      <FileSpreadsheet size={15} color="var(--sand-500)" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {ds.fileName}
                      </span>
                    </div>

                    <div className="meta-token" title="Researcher uploader">
                      <User size={15} color="var(--sand-500)" />
                      <span>{ds.uploadedBy?.name || 'Anonymous Researcher'}</span>
                    </div>

                    <div className="meta-token" title="Ingestion date">
                      <Calendar size={15} color="var(--sand-500)" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {ds.columns && ds.columns.length > 0 && (
                    <div className="card-columns-shelf">
                      <div className="columns-shelf-label">
                        Measured Variables ({ds.columns.length})
                      </div>
                      <div className="column-tags-wrap">
                        {ds.columns.slice(0, 5).map((col) => (
                          <span key={col} className="climate-column-tag">
                            {col}
                          </span>
                        ))}
                        {ds.columns.length > 5 && (
                          <span className="climate-column-tag" style={{ color: 'var(--sand-500)' }}>
                            +{ds.columns.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="card-action-footer">
                    <Link
                      to={`/datasets/${ds._id}`}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'space-between' }}
                    >
                      <span style={{ fontWeight: 600 }}>Explore Visuals & Statistics</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
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
