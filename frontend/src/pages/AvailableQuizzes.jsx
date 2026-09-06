import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../store/slices/quizSlice';
import { startAttempt, clearAttemptStatus } from '../store/slices/attemptSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  GraduationCap,
  Clock,
  HelpCircle,
  PlayCircle,
  Layers,
  AlertCircle,
} from 'lucide-react';

const AvailableQuizzes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { quizzes, loading: quizzesLoading } = useSelector((state) => state.quiz);
  const { loading: attemptLoading, error: attemptError } = useSelector((state) => state.attempt);
  const [startingQuizId, setStartingQuizId] = useState(null);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const handleStartQuiz = async (quizId) => {
    setStartingQuizId(quizId);
    dispatch(clearAttemptStatus());
    const res = await dispatch(startAttempt(quizId));
    if (!res.error && res.payload) {
      navigate(`/student/quiz/${quizId}/attempt/${res.payload.attemptId}`);
    }
    setStartingQuizId(null);
  };

  if (quizzesLoading && quizzes.length === 0) {
    return <LoadingSpinner message="Fetching available quizzes..." />;
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Available Assessments</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Choose a quiz to begin. Each assessment has a strict countdown timer and a maximum of 3 attempts.
        </p>
      </div>

      <ErrorMessage message={attemptError} onDismiss={() => dispatch(clearAttemptStatus())} />

      {quizzes.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <HelpCircle size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Active Assessments</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto' }}>
            Instructors have not published any assessments yet. Please check back later!
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-published">
                  {quiz.questionBankTitle}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Max 3 attempts
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{quiz.title}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} color="var(--amber)" />
                  <span>Time Limit: <strong>{quiz.timeLimitMinutes} minutes</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Layers size={14} color="var(--cyan)" />
                  <span>Total Questions: <strong>{quiz.questionCount}</strong></span>
                </div>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz.id)}
                disabled={startingQuizId === quiz.id || quiz.questionCount === 0}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {startingQuizId === quiz.id ? (
                  'Starting Quiz...'
                ) : (
                  <>
                    <PlayCircle size={18} />
                    Start Assessment
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableQuizzes;
