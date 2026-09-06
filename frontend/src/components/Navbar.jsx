import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Sparkles, LogOut, User, Trophy, BookOpen } from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '0.85rem 2rem',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: '1.4rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              QUIZQUARRY
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: 'var(--cyan)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginTop: -4,
            }}>
              AI Assessment Platform
            </span>
          </div>
        </Link>

        {/* Global Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link
            to="/leaderboard"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trophy size={16} color="#fbbf24" />
            <span>Leaderboard</span>
          </Link>

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* User badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: role === 'INSTRUCTOR' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <User size={16} color={role === 'INSTRUCTOR' ? '#818cf8' : '#22d3ee'} />
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{user.fullName}</div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: role === 'INSTRUCTOR' ? '#a5b4fc' : '#67e8f9',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {role}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.5rem', borderRadius: '50%' }}
              >
                <LogOut size={16} color="#fda4af" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
