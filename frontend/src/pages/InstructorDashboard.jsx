import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBanks } from '../store/slices/questionBankSlice';
import { fetchQuizzes } from '../store/slices/quizSlice';
import { attemptApi } from '../api/attemptApi';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Database,
  ClipboardList,
  Sparkles,
  Users,
  Plus,
  ArrowRight,
  BarChart2,
} from 'lucide-react';

const InstructorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { banks, loading: banksLoading } = useSelector((state) => state.questionBank);
  const { quizzes, loading: quizzesLoading } = useSelector((state) => state.quiz);

  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchBanks());
    dispatch(fetchQuizzes());
    attemptApi.getInstructorReport()
      .then((res) => setReport(res.data))
      .catch((err) => console.error(err))
      .finally(() => setReportLoading(false));
  }, [dispatch]);

  const isLoading = banksLoading || quizzesLoading || reportLoading;

  if (isLoading) {
    return <LoadingSpinner message="Loading instructor overview..." />;
  }

  const publishedQuizzesCount = quizzes.filter((q) => q.status === 'PUBLISHED').length;

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
            Welcome back, {user?.fullName} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage your question repository, generate AI assessments, and review student grades.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/instructor/ai-generator" className="btn btn-cyan btn-sm">
            <Sparkles size={16} />
            AI Question Studio
          </Link>
          <Link to="/instructor/quizzes" className="btn btn-primary btn-sm">
            <Plus size={16} />
            New Quiz
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>QUESTION BANKS</span>
            <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-sm)' }}>
              <Database size={20} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            {banks.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            {report?.totalQuestions || 0} total questions stored
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ACTIVE QUIZZES</span>
            <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: 'var(--radius-sm)' }}>
              <ClipboardList size={20} color="var(--cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            {publishedQuizzesCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            {quizzes.length} total quizzes created
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>STUDENT ATTEMPTS</span>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)' }}>
              <Users size={20} color="var(--emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            {report?.totalAttempts || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Evaluated submissions
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>AVERAGE SCORE</span>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-sm)' }}>
              <BarChart2 size={20} color="var(--amber)" />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            {report?.averageScore ? `${report.averageScore}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            Across all student submissions
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Quizzes Card */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Quiz Assessments</h3>
            <Link to="/instructor/quizzes" style={{ color: 'var(--cyan)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)' }}>
              No quizzes created yet. Start by creating a question bank and quiz.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {quizzes.slice(0, 4).map((quiz) => (
                <div key={quiz.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{quiz.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Bank: {quiz.questionBankTitle} • {quiz.timeLimitMinutes} mins • {quiz.questionCount} questions
                    </div>
                  </div>
                  <span className={`badge ${quiz.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}`}>
                    {quiz.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Banks Quick Access */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Question Repositories</h3>
            <Link to="/instructor/banks" style={{ color: 'var(--cyan)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Manage Banks <ArrowRight size={14} />
            </Link>
          </div>

          {banks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)' }}>
              No question banks found. Click below to create your first bank.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {banks.slice(0, 4).map((bank) => (
                <Link
                  key={bank.id}
                  to={`/instructor/banks/${bank.id}/questions`}
                  className="glass-card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                      {bank.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Subject: {bank.subjectArea}
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--primary)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                  }}>
                    {bank.questionCount} Questions
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
