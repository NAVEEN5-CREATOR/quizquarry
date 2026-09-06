import React from 'react';
import { Flag } from 'lucide-react';

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelectOption,
  isFlagged,
  onToggleFlag,
}) => {
  if (!question) return null;

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'EASY': return <span className="badge badge-easy">Easy</span>;
      case 'HARD': return <span className="badge badge-hard">Hard</span>;
      default: return <span className="badge badge-medium">Medium</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--cyan)',
          }}>
            Question {questionNumber} of {totalQuestions}
          </span>
          {getDifficultyBadge(question.difficultyLevel)}
        </div>

        <button
          type="button"
          onClick={onToggleFlag}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: isFlagged ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isFlagged ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-subtle)'}`,
            color: isFlagged ? '#fbbf24' : 'var(--text-muted)',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.825rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
        >
          <Flag size={14} fill={isFlagged ? '#fbbf24' : 'none'} />
          <span>{isFlagged ? 'Flagged' : 'Flag for Review'}</span>
        </button>
      </div>

      {/* Question Prompt */}
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '2rem',
        lineHeight: 1.6,
        color: '#f9fafb',
      }}>
        {question.questionText}
      </h3>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {question.options?.map((option, idx) => {
          const letter = optionLetters[idx] || String(idx + 1);
          const isSelected = selectedOption === option;

          return (
            <div
              key={idx}
              onClick={() => onSelectOption(option)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(17, 24, 39, 0.6)',
                border: isSelected
                  ? '1px solid rgba(99, 102, 241, 0.6)'
                  : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? '0 0 16px var(--primary-glow)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Option Letter Bubble */}
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '0.95rem',
                background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}>
                {letter}
              </div>

              {/* Option Text */}
              <div style={{
                fontSize: '1rem',
                color: isSelected ? '#ffffff' : 'var(--text-main)',
                fontWeight: isSelected ? 600 : 400,
                flex: 1,
              }}>
                {option}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
