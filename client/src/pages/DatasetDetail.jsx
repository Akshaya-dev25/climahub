import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
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
  CheckCircle,
} from 'lucide-react';

// Palette for multiple metrics in charts
const CHART_COLORS = [
  '#0d9488', // Teal
  '#0284c7', // Sky Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#ef4444', // Red
];

const DatasetDetail = () => {
  const { id } = useParams();

  const [dataset, setDataset] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');

  // Visualization state
  const [chartType, setChartType] = useState('line'); // 'line' | 'bar'
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

        // Determine initial X-Axis key
        const cols = ds.columns || [];
        const possibleX = cols.find((c) =>
          ['date', 'timestamp', 'station_id', 'city', 'location', 'id'].includes(c.toLowerCase())
        ) || cols[0] || 'index';
        setXAxisKey(possibleX);
      }

      if (statsRes.data?.success) {
        setStatsData(statsRes.data);
        const numericCols = statsRes.data.numericColumns || [];
        // Default select up to 2 numeric metrics for clear initial visualization
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
        err.response?.data?.message || 'Failed to post comment. Make sure you are logged in.'
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

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading dataset analytics and calculations...</p>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div style={{ maxWidth: 640, margin: '2rem auto' }}>
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={20} />
          <span>{error || 'Dataset not found.'}</span>
        </div>
        <Link to="/" className="btn btn-secondary">
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
    // Coerce numeric metrics to real numbers for charts
    numericColumns.forEach((col) => {
      item[col] = Number(row[col]) || 0;
    });
    return item;
  });

  return (
    <div>
      {/* Top Navigation */}
      <Link to="/" className="detail-nav-back">
        <ArrowLeft size={16} />
        <span>Back to Datasets</span>
      </Link>

      {/* Dataset Header Card */}
      <div className="detail-header">
        <div className="detail-title-row">
          <div>
            <h1 className="detail-title">{dataset.title}</h1>
            <p className="detail-desc">{dataset.description || 'No description provided.'}</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary-text)',
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <FileSpreadsheet size={16} />
              <span>{dataset.fileName}</span>
            </span>
          </div>
        </div>

        {/* Quick Meta Cards */}
        <div className="detail-stats-grid">
          <div className="stat-metric-card">
            <div className="stat-metric-label">Total Observations</div>
            <div className="stat-metric-value">{dataset.rowCount?.toLocaleString() || 0}</div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-label">Numeric Metrics</div>
            <div className="stat-metric-value">{numericColumns.length}</div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-label">Uploaded By</div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginTop: '0.35rem',
              }}
            >
              {dataset.uploadedBy?.name || 'Anonymous'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {dataset.uploadedBy?.email}
            </div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-label">Upload Timestamp</div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginTop: '0.35rem',
              }}
            >
              {new Date(dataset.createdAt).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {new Date(dataset.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* 1. VISUALIZATION SECTION (Recharts: Line and Bar Chart) */}
      <section className="detail-section">
        <div className="detail-section-header">
          <div className="detail-section-title">
            <BarChart2 size={20} color="var(--primary)" />
            <span>Interactive Data Visualization</span>
          </div>

          <div className="chart-controls">
            {/* Chart Type Toggle */}
            <div className="btn-toggle-group">
              <button
                type="button"
                className={`btn-toggle ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                Line Chart
              </button>
              <button
                type="button"
                className={`btn-toggle ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                Bar Chart
              </button>
            </div>

            {/* X-Axis selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                X-Axis:
              </span>
              <select
                className="chart-select"
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
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}
          >
            Select Numeric Metric(s) to Display:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {numericColumns.map((col, idx) => {
              const isSelected = selectedMetrics.includes(col);
              const color = CHART_COLORS[idx % CHART_COLORS.length];
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => handleToggleMetric(col)}
                  style={{
                    backgroundColor: isSelected ? `${color}18` : 'var(--bg-surface-secondary)',
                    borderColor: isSelected ? color : 'var(--border)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: isSelected ? color : 'var(--text-muted)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? color : '#94a3b8',
                    }}
                  />
                  <span>{col}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart Canvas */}
        <div style={{ width: '100%', height: 380, marginTop: '1.5rem' }}>
          {numericColumns.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No numeric columns detected in this dataset to generate charts.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {selectedMetrics.map((metric, idx) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={CHART_COLORS[numericColumns.indexOf(metric) % CHART_COLORS.length]}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  {selectedMetrics.map((metric) => (
                    <Bar
                      key={metric}
                      dataKey={metric}
                      fill={CHART_COLORS[numericColumns.indexOf(metric) % CHART_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* 2. STATS TABLE (mean, min, max from /api/datasets/:id/stats) */}
      <section className="detail-section">
        <div className="detail-section-header">
          <div className="detail-section-title">
            <Table size={20} color="var(--secondary)" />
            <span>Summary Statistics (Mean, Min, Max)</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Computed across {statsData?.totalRows || 0} observations
          </span>
        </div>

        {numericColumns.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>
            No numeric statistics available for this dataset.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Column / Metric</th>
                  <th>Count</th>
                  <th>Mean</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Sum</th>
                </tr>
              </thead>
              <tbody>
                {numericColumns.map((col) => {
                  const stat = statsMap[col] || {};
                  return (
                    <tr key={col}>
                      <td style={{ fontWeight: 700 }}>
                        <span className="font-mono">{col}</span>
                      </td>
                      <td>{stat.count ?? '-'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {stat.mean !== undefined ? stat.mean.toLocaleString() : '-'}
                      </td>
                      <td style={{ color: '#0284c7' }}>
                        {stat.min !== undefined ? stat.min.toLocaleString() : '-'}
                      </td>
                      <td style={{ color: '#ef4444' }}>
                        {stat.max !== undefined ? stat.max.toLocaleString() : '-'}
                      </td>
                      <td>{stat.sum !== undefined ? stat.sum.toLocaleString() : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Raw Data Preview (First 10 Rows) */}
      <section className="detail-section">
        <div className="detail-section-header">
          <div className="detail-section-title">
            <Layers size={20} color="var(--primary)" />
            <span>Dataset Preview (First {Math.min(10, dataset.parsedData?.length || 0)} rows)</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 45 }}>#</th>
                {dataset.columns?.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.parsedData?.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>{idx + 1}</td>
                  {dataset.columns?.map((col) => (
                    <td key={col} className="font-mono">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. COMMENTS SECTION */}
      <section className="detail-section">
        <div className="detail-section-header">
          <div className="detail-section-title">
            <MessageSquare size={20} color="var(--primary)" />
            <span>Discussion & Comments ({comments.length})</span>
          </div>
        </div>

        {commentError && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle size={18} />
            <span>{commentError}</span>
          </div>
        )}

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="comment-form" style={{ marginBottom: '2rem' }}>
          <textarea
            className="comment-textarea"
            placeholder="Share insights, methodology notes, or inquiries about this dataset..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingComment || !newComment.trim()}
            >
              <Send size={16} />
              <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p>No comments yet. Start the academic discussion by posting above!</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((c) => (
              <div key={c._id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-author">{c.user?.name || 'Researcher'}</span>
                  <span className="comment-time">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </span>
                </div>
                <p className="comment-body">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DatasetDetail;
