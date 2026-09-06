import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuizzes,
  createQuiz,
  publishQuiz,
  deleteQuiz,
  clearQuizStatus,
} from '../store/slices/quizSlice';
import { fetchBanks } from '../store/slices/questionBankSlice';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  ClipboardList,
  Plus,
  Trash2,
  Globe,
  Clock,
  Database,
  CheckCircle2,
  Users,
} from 'lucide-react';

const QuizList = () => {
  const dispatch = useDispatch();
  const { quizzes, loading, error, successMessage } = useSelector((state) => state.quiz);
  const { banks } = useSelector((state) => state.questionBank);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [title, setTitle] = useState('');
  const [questionBankId, setQuestionBankId] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchBanks());
  }, [dispatch]);

  useEffect(() => {
    if (banks.length > 0 && !questionBankId) {
      setQuestionBankId(String(banks[0].id));
    }
  }, [banks, questionBankId]);

  const handleOpenCreate = () => {
    setTitle('');
    setTimeLimitMinutes(15);
    if (banks.length > 0) {
      setQuestionBankId(String(banks[0].id));
    }
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !questionBankId) return;

    const res = await dispatch(createQuiz({
      title: title.trim(),
      questionBankId: Number(questionBankId),
      timeLimitMinutes: Number(timeLimitMinutes),
      status: 'DRAFT',
    }));

    if (!res.error) {
      setIsCreateOpen(false);
    }
  };

  const handlePublish = async (quizId) => {
    await dispatch(publishQuiz(quizId));
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuiz) return;
    await dispatch(deleteQuiz(selectedQuiz.id));
    setIsDeleteOpen(false);
  };

  if (loading && quizzes.length === 0) {
    return <LoadingSpinner message="Loading quizzes..." />;
  }

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
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Assessments & Quizzes</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Configure timed tests, allocate question pools, and publish for student evaluation.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
          <Plus size={16} />
          Create New Quiz
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => dispatch(clearQuizStatus())} />

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

      {quizzes.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ClipboardList size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Quizzes Created Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto 1.5rem' }}>
            Assemble your first assessment from an existing question bank.
          </p>
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={16} /> Create First Quiz
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className={`badge ${quiz.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}`}>
                  {quiz.status}
                </span>

                <button
                  onClick={() => { setSelectedQuiz(quiz); setIsDeleteOpen(true); }}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.35rem', borderRadius: '50%' }}
                  title="Delete Quiz"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{quiz.title}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Database size={14} color="var(--cyan)" />
                  <span>Bank: <strong>{quiz.questionBankTitle}</strong> ({quiz.questionCount} questions)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} color="var(--amber)" />
                  <span>Time Limit: <strong>{quiz.timeLimitMinutes} minutes</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={14} color="var(--emerald)" />
                  <span>Submissions: <strong>{quiz.totalAttempts || 0} student attempts</strong></span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                {quiz.status === 'DRAFT' ? (
                  <button
                    onClick={() => handlePublish(quiz.id)}
                    className="btn btn-cyan btn-sm"
                    style={{ width: '100%' }}
                  >
                    <Globe size={14} />
                    Publish Quiz
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22d3ee', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> Live & Available to Students
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Assessment">
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Assessment Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Examination: Java Core & Distributed Systems"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Question Bank</label>
            {banks.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No question banks found. Please create a question bank first.
              </div>
            ) : (
              <select
                className="form-select"
                value={questionBankId}
                onChange={(e) => setQuestionBankId(e.target.value)}
                required
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.questionCount} questions)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Time Limit (Minutes)</label>
            <input
              type="number"
              className="form-input"
              min="1"
              max="180"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={banks.length === 0}>
              Create Quiz
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${selectedQuiz?.title}"? All student attempts for this quiz will be deleted.`}
        confirmText="Delete Quiz"
        isDanger={true}
      />
    </div>
  );
};

export default QuizList;
