import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectOption,
  toggleFlagQuestion,
  setCurrentQuestionIndex,
  submitAttempt,
  fetchAttempt,
} from '../store/slices/attemptSlice';
import QuizTimer from '../components/QuizTimer';
import QuestionCard from '../components/QuestionCard';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Flag,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const QuizAttempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    activeAttempt,
    currentQuestionIndex,
    selectedAnswers,
    flaggedQuestions,
    submitting,
    error,
  } = useSelector((state) => state.attempt);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  // If page is refreshed during attempt, attempt info can be loaded
  useEffect(() => {
    if (!activeAttempt && attemptId) {
      dispatch(fetchAttempt(attemptId));
    }
  }, [activeAttempt, attemptId, dispatch]);

  const questions = activeAttempt?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  const handleSelectOption = (option) => {
    if (!currentQuestion) return;
    dispatch(selectOption({ questionId: currentQuestion.id, option }));
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    dispatch(toggleFlagQuestion(currentQuestion.id));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1));
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex - 1));
    }
  };

  const handleSubmit = async (isAuto = false) => {
    if (isAuto) setIsAutoSubmitting(true);
    const res = await dispatch(submitAttempt({
      attemptId: Number(attemptId),
      answers: selectedAnswers,
    }));

    if (!res.error && res.payload) {
      navigate(`/student/attempt/${attemptId}/result`);
    }
  };

  if (!activeAttempt) {
    return <LoadingSpinner message="Preparing assessment session..." />;
  }

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        padding: '1rem 1.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'var(--backdrop-blur)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>
            {activeAttempt.quizTitle}
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Attempt #{activeAttempt.attemptNumber} of 3 • {answeredCount}/{totalQuestions} Answered
          </div>
        </div>

        {/* Timer */}
        <QuizTimer
          totalMinutes={activeAttempt.timeLimitMinutes}
          startedAt={activeAttempt.startedAt}
          onTimeUp={() => handleSubmit(true)}
        />
      </div>

      <ErrorMessage message={error} />

      {isAutoSubmitting && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.2)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.25rem',
          color: '#fda4af',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          <AlertTriangle size={18} />
          <span>Time is up! Auto-submitting your answers...</span>
        </div>
      )}

      {/* Question Navigator Grid */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        padding: '0.75rem',
        marginBottom: '1.5rem',
        background: 'rgba(17, 24, 39, 0.5)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}>
        {questions.map((q, idx) => {
          const isCurrent = idx === currentQuestionIndex;
          const isAnswered = selectedAnswers[q.id] !== undefined;
          const isFlagged = flaggedQuestions[q.id];

          return (
            <button
              key={q.id}
              onClick={() => dispatch(setCurrentQuestionIndex(idx))}
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                border: isCurrent
                  ? '2px solid var(--cyan)'
                  : isFlagged
                  ? '1px dashed #fbbf24'
                  : '1px solid var(--border-subtle)',
                background: isCurrent
                  ? 'rgba(6, 182, 212, 0.25)'
                  : isAnswered
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(255, 255, 255, 0.04)',
                color: isCurrent
                  ? '#ffffff'
                  : isAnswered
                  ? '#34d399'
                  : 'var(--text-muted)',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              {idx + 1}
              {isFlagged && (
                <div style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#fbbf24',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          selectedOption={selectedAnswers[currentQuestion.id]}
          onSelectOption={handleSelectOption}
          isFlagged={!!flaggedQuestions[currentQuestion.id]}
          onToggleFlag={handleToggleFlag}
        />
      )}

      {/* Bottom Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.5rem',
        padding: '1rem 0',
      }}>
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} /> Previous
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button onClick={handleNext} className="btn btn-secondary">
              Next <ArrowRight size={16} />
            </button>
          ) : null}

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.625rem 1.5rem' }}
          >
            <Send size={16} /> Submit Quiz
          </button>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={() => handleSubmit(false)}
        title="Submit Assessment"
        message={`You have answered ${answeredCount} of ${totalQuestions} questions. ${
          unansweredCount > 0
            ? `Warning: You have ${unansweredCount} unanswered questions!`
            : 'All questions have been answered.'
        } Are you sure you want to finish and submit for grading?`}
        confirmText="Finish & Submit"
        loading={submitting}
      />
    </div>
  );
};

export default QuizAttempt;
