import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/slices/authSlice';
import ErrorMessage from '../components/ErrorMessage';
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ fullName, email, password, role }));
    if (!result.error) {
      if (role === 'INSTRUCTOR') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 75px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="glass-panel" style={{ maxWidth: 520, width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 20px var(--primary-glow)',
          }}>
            <Sparkles size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join QUIZQUARRY as an educator or test-taker
          </p>
        </div>

        <ErrorMessage message={error} onDismiss={() => dispatch(clearError())} />

        <form onSubmit={handleSubmit}>
          {/* Role selector cards */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">I am joining as a:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                onClick={() => setRole('STUDENT')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: role === 'STUDENT' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${role === 'STUDENT' ? 'var(--cyan)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <GraduationCap size={24} color={role === 'STUDENT' ? 'var(--cyan)' : 'var(--text-muted)'} style={{ margin: '0 auto 0.4rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Student</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Take quizzes & compete</div>
              </div>

              <div
                onClick={() => setRole('INSTRUCTOR')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: role === 'INSTRUCTOR' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${role === 'INSTRUCTOR' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <ShieldCheck size={24} color={role === 'INSTRUCTOR' ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 0.4rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Instructor</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Create banks & quizzes</div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min 6 characters)</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Get Started'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
