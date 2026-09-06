import React, { useEffect, useState } from 'react';
import { attemptApi } from '../api/attemptApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  BarChart3,
  Award,
  Users,
  Database,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';

const InstructorReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    attemptApi.getInstructorReport()
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.message || 'Failed to load instructor report'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating assessment analytics..." />;
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Instructor Analytics & Reports</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Detailed visibility into quiz completion rates, student score distributions, and difficulty metrics.
        </p>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>TOTAL ASSESSMENTS</span>
            <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-sm)' }}>
              <ClipboardCheck size={20} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800 }}>{report?.totalQuizzes || 0}</div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>EVALUATED ATTEMPTS</span>
            <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: 'var(--radius-sm)' }}>
              <Users size={20} color="var(--cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800 }}>{report?.totalAttempts || 0}</div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>AVERAGE SCORE</span>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)' }}>
              <TrendingUp size={20} color="var(--emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            {report?.averageScore ? `${report.averageScore}%` : 'N/A'}
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>TOTAL QUESTIONS</span>
            <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: 'var(--radius-sm)' }}>
              <Database size={20} color="var(--purple)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800 }}>{report?.totalQuestions || 0}</div>
        </div>
      </div>

      {/* Quiz Breakdown Table */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} color="var(--cyan)" />
          Quiz Performance Breakdown
        </h3>

        {!report?.quizPerformance || report.quizPerformance.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
            No quiz performance data available yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Quiz Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Question Bank</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Total Attempts</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Average Score</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>High / Low</th>
                </tr>
              </thead>
              <tbody>
                {report.quizPerformance.map((perf) => (
                  <tr key={perf.quizId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{perf.quizTitle}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{perf.bankTitle}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span className="badge badge-inprogress">{perf.attemptsCount}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: perf.avgScore >= 75 ? '#34d399' : perf.avgScore >= 50 ? '#fbbf24' : '#fb7185',
                      }}>
                        {perf.attemptsCount > 0 ? `${perf.avgScore}%` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem' }}>
                      {perf.attemptsCount > 0 ? `${perf.highestScore}% / ${perf.lowestScore}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorReports;
