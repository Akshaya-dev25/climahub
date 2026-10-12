import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  Calendar,
  User,
  FileSpreadsheet,
  BarChart2,
  Table,
  MessageSquare,
  Send,
  Layers,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

// Climate-themed palette for multi-metric charts
const THEME_CHART_COLORS = [
  '#0d9488', // Ocean Teal
  '#0284c7', // Sky Blue
  '#047857', // Forest Green
  '#d97706', // Sunny Amber
  '#e11d48', // Coral
  '#6366f1', // Indigo
];

const DatasetDetail = () => {
  const { id } = useParams();

  const [dataset, setDataset] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');

  // Visualization state
  const [chartType, setChartType] = useState('area'); // 'area' | 'line' | 'bar'
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [xAxisKey, setXAxisKey] = useState('');

  // Fetch Dataset Info & Data
  const fetchDatasetDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [datasetRes, statsRes, commentsRes] = await Promise.all([
        api.get(`/datasets/${id}`),
        api.get(`/datasets/${id}/stats`),
        api.get(`/datasets/${id}/comments`),
      ]);

      if (datasetRes.data?.success) {
        const ds = datasetRes.data.dataset;
        setDataset(ds);

        // Determine default X-Axis key
        const cols = ds.columns || [];
        const candidateX = cols.find((c) =>
          ['date', 'timestamp', 'station_id', 'city', 'location', 'time'].includes(c.toLowerCase())
        ) || cols[0] || 'index';
        setXAxisKey(candidateX);
      }

      if (statsRes.data?.success) {
        setStatsData(statsRes.data);
        const numericCols = statsRes.data.numericColumns || [];
        // Default select up to 2 numeric metrics for readable visualization
        setSelectedMetrics(numericCols.slice(0, 2));
      }

      if (commentsRes.data?.success) {
        setComments(commentsRes.data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching dataset details:', err);
      setError(
        err.response?.data?.message || 'Failed to load dataset details. Please check the ID or try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDatasetDetails();
  }, [fetchDatasetDetails]);

  // Handle Comment Submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      setCommentError('');
      const res = await api.post(`/datasets/${id}/comments`, { text: newComment.trim() });
      if (res.data?.success && res.data?.comment) {
        setComments((prev) => [res.data.comment, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      setCommentError(
        err.response?.data?.message || 'Failed to post comment. Ensure you are signed in.'
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleMetric = (metric) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length === 1) return; // Keep at least one selected
      setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'R';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, gap: '1rem' }}>
        <div className="spinner-loader" />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Analyzing climate matrices and compiling metrics...</p>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div style={{ maxWidth: 640, margin: '3rem auto', textAlign: 'center' }}>
        <div className="alert-banner alert-error" role="alert" style={{ justifyContent: 'center' }}>
          <AlertCircle size={20} />
          <span>{error || 'Dataset not found.'}</span>
        </div>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const numericColumns = statsData?.numericColumns || [];
  const statsMap = statsData?.stats || {};
  const chartData = (dataset.parsedData || []).map((row, index) => {
    const item = { ...row, _rowIndex: index + 1 };
    numericColumns.forEach((col) => {
      item[col] = Number(row[col]) || 0;
    });
    return item;
  });

  return (
    <div>
      {/* Top Back Navigation */}
      <div className="detail-top-nav-wrap">
        <Link to="/" className="back-link-stylish">
          <ArrowLeft size={15} />
          <span>Back to Climate Repository</span>
        </Link>
      </div>

      {/* Main Dataset Header */}
      <div className="detail-main-header">
        <div className="detail-header-accent" />

        <div className="detail-header-headline-row">
          <div>
            <h1 className="detail-header-title">{dataset.title}</h1>
            <p className="detail-header-desc">
              {dataset.description || 'Public academic climate dataset deposited in ClimaHub without supplementary methodology notes.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                backgroundColor: 'var(--sand-100)',
                color: 'var(--forest-900)',
                border: '1px solid var(--border-card)',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <FileSpreadsheet size={16} color="var(--ocean-700)" />
              <span style={{ fontFamily: 'var(--font-mono)' }}>{dataset.fileName}</span>
            </span>
          </div>
        </div>

        {/* Quick Meta Cards */}
        <div className="detail-quick-stats-grid">
          <div className="quick-stat-box">
            <div className="quick-stat-label">Total Observations</div>
            <div className="quick-stat-value">{(dataset.rowCount || 0).toLocaleString()}</div>
          </div>

          <div className="quick-stat-box">
            <div className="quick-stat-label">Numeric Variables</div>
            <div className="quick-stat-value">{numericColumns.length}</div>
          </div>

          <div className="quick-stat-box">
            <div className="quick-stat-label">Lead Investigator</div>
            <div className="quick-stat-value" style={{ fontSize: '1.25rem' }}>
              {dataset.uploadedBy?.name || 'Anonymous'}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {dataset.uploadedBy?.email}
            </div>
          </div>

          <div className="quick-stat-box">
            <div className="quick-stat-label">Ingested On</div>
            <div className="quick-stat-value" style={{ fontSize: '1.25rem' }}>
              {new Date(dataset.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {new Date(dataset.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* 1. CLEANER CHART CARD WITH GRADIENT AREA / LINE / BAR CHART */}
      <section className="science-card-section">
        <div className="science-card-header">
          <div className="science-card-title">
            <BarChart2 size={22} color="var(--ocean-700)" />
            <span>Interactive Climate Visualizer</span>
          </div>

          <div className="chart-pills-row">
            {/* Chart Type Selector */}
            <div className="chart-type-switcher">
              <button
                type="button"
                className={`switcher-btn ${chartType === 'area' ? 'active' : ''}`}
                onClick={() => setChartType('area')}
              >
                Gradient Area
              </button>
              <button
                type="button"
                className={`switcher-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                Line Plot
              </button>
              <button
                type="button"
                className={`switcher-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                Bar Columns
              </button>
            </div>

            {/* X-Axis Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--sand-500)' }}>
                X-Axis:
              </span>
              <select
                className="chart-axis-select"
                value={xAxisKey}
                onChange={(e) => setXAxisKey(e.target.value)}
              >
                {dataset.columns?.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--sand-500)',
              marginBottom: '0.65rem',
            }}
          >
            Select Climate Variable(s) to Plot:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
            {numericColumns.map((col, idx) => {
              const isSelected = selectedMetrics.includes(col);
              const color = THEME_CHART_COLORS[idx % THEME_CHART_COLORS.length];
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => handleToggleMetric(col)}
                  style={{
                    backgroundColor: isSelected ? `${color}15` : 'var(--sand-50)',
                    borderColor: isSelected ? color : 'var(--border-card)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: isSelected ? color : 'var(--sand-700)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? color : '#a8a29e',
                    }}
                  />
                  <span>{col}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recharts Canvas */}
        <div style={{ width: '100%', height: 400 }}>
          {numericColumns.length === 0 ? (
            <div className="empty-state-friendly" style={{ padding: '2.5rem' }}>
              <p>No numeric time-series columns detected to graph in this dataset.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <defs>
                    {numericColumns.map((metric, idx) => {
                      const color = THEME_CHART_COLORS[idx % THEME_CHART_COLORS.length];
                      return (
                        <linearGradient key={`grad-${metric}`} id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#78716c"
                    fontSize={12}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#78716c" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      fontSize: '0.875rem',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {selectedMetrics.map((metric) => {
                    const color = THEME_CHART_COLORS[numericColumns.indexOf(metric) % THEME_CHART_COLORS.length];
                    return (
                      <Area
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={color}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill={`url(#grad-${metric})`}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#78716c"
                    fontSize={12}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#78716c" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      fontSize: '0.875rem',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {selectedMetrics.map((metric) => {
                    const color = THEME_CHART_COLORS[numericColumns.indexOf(metric) % THEME_CHART_COLORS.length];
                    return (
                      <Line
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#78716c"
                    fontSize={12}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#78716c" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e7e5e4',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      fontSize: '0.875rem',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {selectedMetrics.map((metric) => {
                    const color = THEME_CHART_COLORS[numericColumns.indexOf(metric) % THEME_CHART_COLORS.length];
                    return (
                      <Bar
                        key={metric}
                        dataKey={metric}
                        fill={color}
                        radius={[6, 6, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* 2. NICER STATS TABLE WITH COLORED MEAN / MIN / MAX BADGES */}
      <section className="science-card-section">
        <div className="science-card-header">
          <div className="science-card-title">
            <Table size={22} color="var(--forest-700)" />
            <span>Summary Statistics Matrix</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Computed across {(statsData?.totalRows || 0).toLocaleString()} observations
          </span>
        </div>

        {numericColumns.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            No numeric variables available for automated summary statistics.
          </p>
        ) : (
          <div className="stats-table-wrapper">
            <table className="science-table">
              <thead>
                <tr>
                  <th>Climate Variable</th>
                  <th>Valid Rows</th>
                  <th>Mean (Average)</th>
                  <th>Min Value</th>
                  <th>Max Value</th>
                  <th>Aggregate Sum</th>
                </tr>
              </thead>
              <tbody>
                {numericColumns.map((col) => {
                  const stat = statsMap[col] || {};
                  return (
                    <tr key={col}>
                      <td style={{ fontWeight: 700, color: 'var(--forest-900)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{col}</span>
                      </td>
                      <td style={{ color: 'var(--sand-700)' }}>
                        {stat.count !== undefined ? stat.count.toLocaleString() : '-'}
                      </td>
                      <td>
                        <span className="badge-metric-mean">
                          {stat.mean !== undefined ? stat.mean.toLocaleString() : '-'}
                        </span>
                      </td>
                      <td>
                        <span className="badge-metric-min">
                          {stat.min !== undefined ? stat.min.toLocaleString() : '-'}
                        </span>
                      </td>
                      <td>
                        <span className="badge-metric-max">
                          {stat.max !== undefined ? stat.max.toLocaleString() : '-'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--sand-800)' }}>
                        {stat.sum !== undefined ? stat.sum.toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Raw Data Preview (First 10 Observations) */}
      <section className="science-card-section">
        <div className="science-card-header">
          <div className="science-card-title">
            <Layers size={22} color="var(--sky-600)" />
            <span>Sample Observations Preview (First {Math.min(10, dataset.parsedData?.length || 0)} records)</span>
          </div>
        </div>

        <div className="stats-table-wrapper">
          <table className="science-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                {dataset.columns?.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.parsedData?.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--sand-500)', fontSize: '0.8rem' }}>{idx + 1}</td>
                  {dataset.columns?.map((col) => (
                    <td key={col} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. CHAT-STYLE COMMENTS SECTION WITH AVATAR INITIALS */}
      <section className="science-card-section">
        <div className="science-card-header">
          <div className="science-card-title">
            <MessageSquare size={22} color="var(--forest-700)" />
            <span>Peer Review & Academic Discussion ({comments.length})</span>
          </div>
        </div>

        {commentError && (
          <div className="alert-banner alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{commentError}</span>
          </div>
        )}

        {/* Comments Chat Thread */}
        {comments.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--sand-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-card)',
              marginBottom: '2rem',
            }}
          >
            <p style={{ fontWeight: 600 }}>No commentary yet for this observation series.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Initiate the scientific discussion regarding measurement methodology or anomalies below.
            </p>
          </div>
        ) : (
          <div className="comments-chat-thread">
            {comments.map((c) => (
              <div key={c._id} className="comment-bubble-row">
                <div className="comment-avatar-bubble">
                  {getInitials(c.user?.name)}
                </div>

                <div className="comment-card-bubble">
                  <div className="comment-header-row">
                    <span className="comment-author-name">{c.user?.name || 'Researcher'}</span>
                    <span className="comment-timestamp">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recently'}
                    </span>
                  </div>
                  <div className="comment-text-content">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Input Form */}
        <form onSubmit={handleAddComment} className="comment-compose-card">
          <textarea
            className="comment-textarea-modern"
            placeholder="Share research notes, sensor calibration notes, or ask a question about this dataset..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingComment || !newComment.trim()}
            >
              <Send size={16} />
              <span>{submittingComment ? 'Posting...' : 'Post Commentary'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default DatasetDetail;
