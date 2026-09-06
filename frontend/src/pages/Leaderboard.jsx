import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../store/slices/attemptSlice';
import { fetchQuizzes } from '../store/slices/quizSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Trophy,
  Medal,
  Award,
  Filter,
  Users,
  Calendar,
} from 'lucide-react';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const { leaderboard, loading } = useSelector((state) => state.attempt);
  const { quizzes } = useSelector((state) => state.quiz);

  const [selectedQuizId, setSelectedQuizId] = useState('');

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const handleFilterChange = (quizId) => {
    setSelectedQuizId(quizId);
    dispatch(fetchLeaderboard(quizId ? Number(quizId) : null));
  };

  const top3 = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)',
          }}>
            <Trophy size={16} />
          </div>
        );
      case 2:
        return (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Medal size={16} />
          </div>
        );
      case 3:
        return (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Award size={16} />
          </div>
        );
      default:
        return (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Trophy size={28} color="#fbbf24" /> Platform Leaderboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Recognizing the top assessments scores across all students.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={selectedQuizId}
            onChange={(e) => handleFilterChange(e.target.value)}
            style={{ width: 240 }}
          >
            <option value="">All Assessments</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating rankings..." />
      ) : leaderboard.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Trophy size={48} color="var(--amber)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Scores Recorded Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto' }}>
            Complete an assessment to earn your place at the top of the leaderboard!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}>
            {top3.map((entry, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;

              return (
                <div
                  key={entry.attemptId}
                  className="glass-panel"
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    position: 'relative',
                    border: isFirst ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid var(--border-subtle)',
                    boxShadow: isFirst ? '0 0 25px rgba(245, 158, 11, 0.15)' : 'var(--shadow-card)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    {getRankBadge(rank)}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{entry.studentName}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                    {entry.quizTitle}
                  </p>

                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: isFirst ? '#fbbf24' : 'var(--cyan)',
                    marginBottom: '0.5rem',
                  }}>
                    {entry.score}%
                  </div>

                  <span className="badge badge-completed" style={{ fontSize: '0.75rem' }}>
                    Attempt #{entry.attemptNumber}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Full Rankings Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>All Ranked Submissions</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem', width: 80 }}>Rank</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Student</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Quiz Assessment</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Attempt</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry.attemptId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {getRankBadge(idx + 1)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{entry.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{entry.studentEmail}</div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{entry.quizTitle}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span className="badge badge-inprogress">#{entry.attemptNumber}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          color: entry.score >= 75 ? '#34d399' : entry.score >= 50 ? '#fbbf24' : '#fb7185',
                        }}>
                          {entry.score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
