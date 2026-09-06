import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuestions,
  createQuestion,
  deleteQuestion,
  clearQuestionStatus,
} from '../store/slices/questionSlice';
import { bankApi } from '../api/bankApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Plus,
  Sparkles,
  ArrowLeft,
  Trash2,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const QuestionList = () => {
  const { bankId } = useParams();
  const dispatch = useDispatch();
  const { questions, loading, error, successMessage } = useSelector((state) => state.question);

  const [bank, setBank] = useState(null);
  const [bankLoading, setBankLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('MEDIUM');

  useEffect(() => {
    if (bankId) {
      dispatch(fetchQuestions(bankId));
      bankApi.getBankById(bankId)
        .then((res) => setBank(res.data))
        .catch((err) => console.error(err))
        .finally(() => setBankLoading(false));
    }
  }, [bankId, dispatch]);

  const handleOpenAdd = () => {
    setQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectOptionIndex(0);
    setExplanation('');
    setDifficultyLevel('MEDIUM');
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const options = [optA.trim(), optB.trim(), optC.trim(), optD.trim()].filter(Boolean);
    if (options.length < 2) {
      alert('Please provide at least 2 options.');
      return;
    }
    const correctAnswer = options[correctOptionIndex] || options[0];

    const payload = {
      questionBankId: Number(bankId),
      questionText: questionText.trim(),
      options,
      correctAnswer,
      explanation: explanation.trim(),
      difficultyLevel,
      isAiGenerated: false,
    };

    const res = await dispatch(createQuestion(payload));
    if (!res.error) {
      setIsAddOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuestion) return;
    await dispatch(deleteQuestion(selectedQuestion.id));
    setIsDeleteOpen(false);
  };

  if (bankLoading || loading) {
    return <LoadingSpinner message="Loading questions..." />;
  }

  return (
    <div className="page-container">
      {/* Back button & header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/instructor/banks"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Question Banks
        </Link>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>
              {bank?.title || 'Questions Repository'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Subject: {bank?.subjectArea} • Total Questions: {questions.length}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              to={`/instructor/ai-generator?bankId=${bankId}`}
              className="btn btn-cyan btn-sm"
            >
              <Sparkles size={16} />
              AI Generate More
            </Link>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <Plus size={16} />
              Add Manual Question
            </button>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => dispatch(clearQuestionStatus())} />

      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: '#34d399',
          marginBottom: '1.25rem',
          fontSize: '0.9rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <HelpCircle size={48} color="var(--cyan)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Questions in this Bank</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto 1.5rem' }}>
            Populate this bank by writing questions manually or using Gemini AI to instantly generate structured MCQs.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={handleOpenAdd} className="btn btn-secondary">
              <Plus size={16} /> Add Manually
            </button>
            <Link to={`/instructor/ai-generator?bankId=${bankId}`} className="btn btn-cyan">
              <Sparkles size={16} /> Generate with AI
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--cyan)', fontSize: '0.95rem' }}>
                    Q{idx + 1}
                  </span>
                  <span className={`badge ${
                    q.difficultyLevel === 'EASY' ? 'badge-easy' : q.difficultyLevel === 'HARD' ? 'badge-hard' : 'badge-medium'
                  }`}>
                    {q.difficultyLevel}
                  </span>
                  {q.isAiGenerated && (
                    <span className="badge badge-ai">
                      <Sparkles size={11} /> AI Generated
                    </span>
                  )}
                </div>

                <button
                  onClick={() => { setSelectedQuestion(q); setIsDeleteOpen(true); }}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.35rem', borderRadius: '50%' }}
                  title="Delete Question"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h4 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {q.questionText}
              </h4>

              {/* Options */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                {q.options?.map((opt, oIdx) => {
                  const isCorrect = opt.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
                  return (
                    <div
                      key={oIdx}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-subtle)'}`,
                        color: isCorrect ? '#34d399' : 'var(--text-muted)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {isCorrect ? <CheckCircle size={16} /> : <div style={{ width: 16 }} />}
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.85rem',
                  color: '#c7d2fe',
                }}>
                  <strong style={{ color: '#ffffff' }}>Explanation: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Manual Add Question Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Manual Question" maxWidth={700}>
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Question Text</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Which Java interface is the root of the collection hierarchy?"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Difficulty Level</label>
              <select
                className="form-select"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Correct Option</label>
              <select
                className="form-select"
                value={correctOptionIndex}
                onChange={(e) => setCorrectOptionIndex(Number(e.target.value))}
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Options (A, B, C, D)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Option A"
                value={optA}
                onChange={(e) => setOptA(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Option B"
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Option C"
                value={optC}
                onChange={(e) => setOptC(e.target.value)}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Option D"
                value={optD}
                onChange={(e) => setOptD(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Explanation</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the selected option is correct..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Question
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question?"
        confirmText="Delete Question"
        isDanger={true}
      />
    </div>
  );
};

export default QuestionList;
