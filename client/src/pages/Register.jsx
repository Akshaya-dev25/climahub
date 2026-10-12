import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  Leaf,
  Waves,
  UserPlus,
  AlertCircle,
  Award,
  Sparkles,
} from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Registration failed. Please try again.'
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
              <span>JOIN THE GLOBAL CLIMATE NETWORK</span>
            </div>

            <div className="split-headline-wrap">
              <h2>Publish & Analyze Environmental Data</h2>
              <p>
                Collaborate with researchers worldwide to aggregate time-series observations,
                model microclimates, and foster reproducible academic research.
              </p>
            </div>

            <div className="split-features-list">
              <div className="split-feature-item">
                <div className="split-feature-icon">
                  <Leaf size={18} />
                </div>
                <div>
                  <div className="split-feature-title">Fast CSV Ingestion</div>
                  <div className="split-feature-desc">
                    Instantly parse station records with automated numeric column detection.
                  </div>
                </div>
              </div>

              <div className="split-feature-item">
                <div className="split-feature-icon">
                  <Waves size={18} />
                </div>
                <div>
                  <div className="split-feature-title">Dynamic Interactive Charts</div>
                  <div className="split-feature-desc">
                    Toggle line and bar visuals across multiple atmospheric parameters.
                  </div>
                </div>
              </div>

              <div className="split-feature-item">
                <div className="split-feature-icon">
                  <Award size={18} />
                </div>
                <div>
                  <div className="split-feature-title">Attribution & Peer Discussion</div>
                  <div className="split-feature-desc">
                    Every dataset credits the uploading researcher with discussion threads.
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
            <h1 className="split-form-title">Create Account</h1>
            <p className="split-form-sub">Register to contribute datasets and explore insights</p>
          </div>

          {error && (
            <div className="alert-banner alert-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-modern">
              <label className="form-label-modern" htmlFor="reg-name">
                Full Name & Title
              </label>
              <input
                id="reg-name"
                type="text"
                className="form-input-modern"
                placeholder="Dr. Maya Lin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern" htmlFor="reg-email">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-input-modern"
                placeholder="maya.lin@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern" htmlFor="reg-password">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                className="form-input-modern"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                className="form-input-modern"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
            >
              <UserPlus size={18} />
              <span>{isSubmitting ? 'Creating account...' : 'Create Researcher Account'}</span>
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--forest-800)' }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
