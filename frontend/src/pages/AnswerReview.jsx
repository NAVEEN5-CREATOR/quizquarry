import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttemptResult } from '../store/slices/attemptSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Award,
} from 'lucide-react';

const AnswerReview = () => {
  const { attemptId } = useParams();
  const dispatch = useDispatch();
  const { submittedResult, loading, error } = useSelector((state) => state.attempt);

  useEffect(() => {
    if (attemptId) {
      dispatch(fetchAttemptResult(attemptId));
    }
  }, [attemptId, dispatch]);

  if (loading || !submittedResult) {
    return <LoadingSpinner message="Loading detailed answer review..." />;
  }

  const { quizTitle, score, correctCount, totalQuestions, answers } = submittedResult;

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Top Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <Link
            to={`/student/attempt/${attemptId}/result`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Result Summary
          </Link>
          <h1 style={{ fontSize: '1.85rem' }}>Assessment Review & Explanations</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {quizTitle} • Scored {score}% ({correctCount}/{totalQuestions} correct)
          </p>
        </div>

        <Link to="/student/quizzes" className="btn btn-secondary btn-sm">
          Return to Quizzes
        </Link>
      </div>

      <ErrorMessage message={error} />

      {/* Questions Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {answers?.map((item, idx) => {
          const isCorrect = item.isCorrect;

          return (
            <div
              key={item.questionId || idx}
              className="glass-panel"
              style={{
                borderLeft: `4px solid ${isCorrect ? 'var(--emerald)' : 'var(--rose)'}`,
                padding: '1.75rem',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{
                    fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                  }}>
                    Question {idx + 1}
                  </span>
                  <span className={`badge ${
                    item.difficultyLevel === 'EASY' ? 'badge-easy' : item.difficultyLevel === 'HARD' ? 'badge-hard' : 'badge-medium'
                  }`}>
                    {item.difficultyLevel}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isCorrect ? '#34d399' : '#fb7185',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}>
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={18} /> Correct
                    </>
                  ) : (
                    <>
                      <XCircle size={18} /> Incorrect
                    </>
                  )}
                </div>
              </div>

              <h4 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {item.questionText}
              </h4>

              {/* Options list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                {item.options?.map((opt, oIdx) => {
                  const isSelected = item.selectedOption?.trim().toLowerCase() === opt.trim().toLowerCase();
                  const isAnswer = item.correctAnswer?.trim().toLowerCase() === opt.trim().toLowerCase();

                  let optBg = 'rgba(255, 255, 255, 0.02)';
                  let optBorder = 'var(--border-subtle)';
                  let optColor = 'var(--text-muted)';

                  if (isAnswer) {
                    optBg = 'rgba(16, 185, 129, 0.15)';
                    optBorder = 'rgba(16, 185, 129, 0.5)';
                    optColor = '#34d399';
                  } else if (isSelected && !isCorrect) {
                    optBg = 'rgba(244, 63, 94, 0.15)';
                    optBorder = 'rgba(244, 63, 94, 0.5)';
                    optColor = '#fb7185';
                  }

                  return (
                    <div
                      key={oIdx}
                      style={{
                        padding: '0.85rem 1.15rem',
                        borderRadius: 'var(--radius-sm)',
                        background: optBg,
                        border: `1px solid ${optBorder}`,
                        color: optColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.925rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 600 }}>{String.fromCharCode(65 + oIdx)}.</span>
                        <span>{opt}</span>
                      </div>

                      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        {isAnswer && '✓ Correct Answer'}
                        {isSelected && !isAnswer && '✗ Your Choice'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation card */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                fontSize: '0.875rem',
                color: '#c7d2fe',
                lineHeight: 1.6,
              }}>
                <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Explanation:
                </div>
                {item.explanation || 'No explanation provided.'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnswerReview;
