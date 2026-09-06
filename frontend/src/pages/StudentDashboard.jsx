import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchQuizzes } from '../store/slices/quizSlice';
import { attemptApi } from '../api/attemptApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  GraduationCap,
  Trophy,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { quizzes, loading: quizzesLoading } = useSelector((state) => state.quiz);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchQuizzes());
    attemptApi.getSubmissionStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setStatsLoading(false));
  }, [dispatch]);

  const isLoading = quizzesLoading || statsLoading;

  if (isLoading) {
    return <LoadingSpinner message="Loading your student workspace..." />;
  }

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Hello, {user?.fullName} 🎓
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track your assessments, test your knowledge against time limits, and climb the leaderboard.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/student/quizzes" className="btn btn-primary btn-sm">
            <GraduationCap size={16} />
            Explore Quizzes
          </Link>
          <Link to="/leaderboard" className="btn btn-secondary btn-sm">
            <Trophy size={16} color="#fbbf24" />
            View Leaderboard
          </Link>
        </div>
      </div>

      {/* Available Quizzes Showcase */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <h3 style={{ fontSize: '1.3rem' }}>Available Assessments</h3>
          <Link to="/student/quizzes" style={{ color: 'var(--cyan)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Browse All ({quizzes.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-dim)' }}>No published quizzes are currently available.</p>
          </div>
        ) : (
          <div className="grid-cards">
            {quizzes.slice(0, 3).map((quiz) => (
              <div key={quiz.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <span className="badge badge-published">
                    {quiz.questionBankTitle}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{quiz.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} color="var(--amber)" /> {quiz.timeLimitMinutes} mins
                  </span>
                  <span>•</span>
                  <span>{quiz.questionCount} Questions</span>
                  <span>•</span>
                  <span>Max 3 Attempts</span>
                </div>

                <Link
                  to="/student/quizzes"
                  className="btn btn-cyan btn-sm"
                  style={{ width: '100%' }}
                >
                  Take Assessment <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Activity / Leaderboard Preview */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={18} color="#fbbf24" /> Top Scorers On The Platform
          </h3>
          <Link to="/leaderboard" style={{ color: 'var(--cyan)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Full Leaderboard →
          </Link>
        </div>

        {!stats?.recentSubmissions || stats.recentSubmissions.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 1rem' }}>
            No submissions recorded yet. Be the first to score!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {stats.recentSubmissions.slice(0, 5).map((entry, idx) => (
              <div
                key={entry.attemptId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: idx === 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: idx === 0 ? '#fbbf24' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{entry.quizTitle}</div>
                  </div>
                </div>

                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: entry.score >= 75 ? '#34d399' : '#fbbf24',
                }}>
                  {entry.score}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
