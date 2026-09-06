import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Database,
  Sparkles,
  ClipboardList,
  BarChart3,
  Trophy,
  GraduationCap,
} from 'lucide-react';

const Sidebar = () => {
  const { role, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) return null;

  const instructorLinks = [
    { to: '/instructor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/instructor/banks', label: 'Question Banks', icon: Database },
    { to: '/instructor/ai-generator', label: 'AI Generator Studio', icon: Sparkles, highlight: true },
    { to: '/instructor/quizzes', label: 'Quizzes', icon: ClipboardList },
    { to: '/instructor/reports', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/quizzes', label: 'Available Quizzes', icon: GraduationCap },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const links = role === 'INSTRUCTOR' ? instructorLinks : studentLinks;

  return (
    <aside style={{
      width: 250,
      background: 'rgba(17, 24, 39, 0.65)',
      backdropFilter: 'blur(12px)',
      borderRight: '1px solid var(--border-subtle)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
    }}>
      <div style={{
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-dim)',
        padding: '0 0.75rem 0.75rem 0.75rem',
        fontWeight: 600,
      }}>
        {role === 'INSTRUCTOR' ? 'Instructor Portal' : 'Student Portal'}
      </div>

      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive
                ? '#ffffff'
                : link.highlight
                ? '#c084fc'
                : 'var(--text-muted)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)'
                : link.highlight
                ? 'rgba(139, 92, 246, 0.08)'
                : 'transparent',
              border: isActive
                ? '1px solid rgba(99, 102, 241, 0.4)'
                : link.highlight
                ? '1px dashed rgba(139, 92, 246, 0.3)'
                : '1px solid transparent',
              transition: 'all 0.2s ease',
            })}
          >
            <Icon size={18} color={link.highlight ? '#c084fc' : undefined} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};

export default Sidebar;
