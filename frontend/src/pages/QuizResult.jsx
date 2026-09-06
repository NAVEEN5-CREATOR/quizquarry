import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttemptResult } from '../store/slices/attemptSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

const QuizResult = () => {
  const { attemptId } = useParams();
  const dispatch = useDispatch();
  const { submittedResult, loading, error } = useSelector((state) => state.attempt);

  useEffect(() => {
    if (attemptId) {
      dispatch(fetchAttemptResult(attemptId));
    }
  }, [attemptId, dispatch]);

  if (loading || !submittedResult) {
    return <LoadingSpinner message="Calculating your final score..." />;
  }

  const {
    quizTitle,
    attemptNumber,
    score,
    correctCount,
    totalQuestions,
    timeSpentSeconds,
    status,
  } = submittedResult;

  const isPassed = score >= 60;
  const minutes = Math.floor((timeSpentSeconds || 0) / 60);
  const seconds = (timeSpentSeconds || 0) % 60;

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <ErrorMessage message={error} />

      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: isPassed
            ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)'
            : 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: isPassed
            ? '0 0 25px rgba(16, 185, 129, 0.4)'
            : '0 0 25px rgba(244, 63, 94, 0.4)',
        }}>
          {isPassed ? <Trophy size={32} color="#ffffff" /> : <Sparkles size={32} color="#ffffff" />}
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
          {isPassed ? 'Assessment Completed!' : 'Assessment Finished'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
          {quizTitle} • Attempt #{attemptNumber}
        </p>

        {/* Score Ring Display */}
        <div style={{
          position: 'relative',
          width: 160,
          height: 160,
          borderRadius: '50%',
          margin: '0 auto 2rem auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(17, 24, 39, 0.9)',
          border: `4px solid ${isPassed ? 'var(--emerald)' : 'var(--amber)'}`,
          boxShadow: `0 0 30px ${isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        }}>
          <span style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            color: isPassed ? '#34d399' : '#fbbf24',
          }}>
            {score}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Final Score
          </span>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          maxWidth: 550,
          margin: '0 auto 2.5rem auto',
        }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#34d399', marginBottom: '0.25rem' }}>
              <CheckCircle2 size={18} />
              <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{correctCount}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Correct</div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#fb7185', marginBottom: '0.25rem' }}>
              <XCircle size={18} />
              <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{totalQuestions - correctCount}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Incorrect</div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#67e8f9', marginBottom: '0.25rem' }}>
              <Clock size={18} />
              <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                {minutes}m {seconds}s
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Time Spent</div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to={`/student/attempt/${attemptId}/review`}
            className="btn btn-cyan"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <BookOpen size={18} />
            Review Answers & Explanations
          </Link>

          <Link
            to="/student/quizzes"
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <GraduationCap size={18} />
            Back to Quizzes
          </Link>

          <Link
            to="/leaderboard"
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <Trophy size={18} color="#fbbf24" />
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
