import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  Leaf,
  Waves,
  LogIn,
  AlertCircle,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="split-auth-container">
      <div className="split-auth-box">
        {/* Left Side: Climate-Themed Gradient Panel */}
        <div className="split-hero-panel">
          <div>
            <div className="split-brand-badge">
              <Globe size={15} />
              <span>CLIMAHUB RESEARCH PORTAL</span>
            </div>

            <div className="split-headline-wrap">
              <h2>Empowering Earth & Atmospheric Science</h2>
              <p>
                A centralized repository designed for universities and institutes to share,
                explore, and visualize open environmental datasets.
              </p>
            </div>

            <div className="split-features-list">
              <div className="split-feature-item">
                <div className="split-feature-icon">
                  <Leaf size={18} />
                </div>
                <div>
                  <div className="split-feature-title">Standardized Climate Metrics</div>
                  <div className="split-feature-desc">
                    CO2 PPM, surface temperatures, precipitation, and humidity streams.
                  </div>
                </div>
              </div>

              <div className="split-feature-item">
                <div className="split-feature-icon">
                  <Waves size={18} />
                </div>
                <div>
                  <div className="split-feature-title">Interactive Time-Series Visuals</div>
                  <div className="split-feature-desc">
                    Dynamic line & area charts with automated mean, min, and max computations.
                  </div>
                </div>
              </div>

              <div className="split-feature-item">
                <div className="split-feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="split-feature-title">Verified University Access</div>
                  <div className="split-feature-desc">
                    Secure JWT authentication and dataset attribution for scientists.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="split-footer-note">
            ClimaHub v1.0 • Built for Open Science & Climate Resilience
          </div>
        </div>

        {/* Right Side: Clean Form Panel */}
        <div className="split-form-panel">
          <div className="split-form-header">
            <h1 className="split-form-title">Welcome Back</h1>
            <p className="split-form-sub">Sign in with your academic credentials to continue</p>
          </div>

          {error && (
            <div className="alert-banner alert-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label className="form-label-modern" htmlFor="login-email">
                Academic Email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input-modern"
                placeholder="researcher@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input-modern"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
            >
              <LogIn size={18} />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            New to the platform?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--forest-800)' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
