import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBanks,
  createBank,
  updateBank,
  deleteBank,
  clearBankStatus,
} from '../store/slices/questionBankSlice';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Database,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const QuestionBankList = () => {
  const dispatch = useDispatch();
  const { banks, loading, error, successMessage } = useSelector((state) => state.questionBank);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedBank, setSelectedBank] = useState(null);
  const [title, setTitle] = useState('');
  const [subjectArea, setSubjectArea] = useState('');

  useEffect(() => {
    dispatch(fetchBanks());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setTitle('');
    setSubjectArea('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (bank) => {
    setSelectedBank(bank);
    setTitle(bank.title);
    setSubjectArea(bank.subjectArea);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (bank) => {
    setSelectedBank(bank);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subjectArea.trim()) return;
    const res = await dispatch(createBank({ title, subjectArea }));
    if (!res.error) {
      setIsCreateOpen(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subjectArea.trim() || !selectedBank) return;
    const res = await dispatch(updateBank({ id: selectedBank.id, data: { title, subjectArea } }));
    if (!res.error) {
      setIsEditOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBank) return;
    await dispatch(deleteBank(selectedBank.id));
    setIsDeleteOpen(false);
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
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Question Banks</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Organize questions by topic or domain to assemble quizzes effortlessly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/instructor/ai-generator" className="btn btn-cyan btn-sm">
            <Sparkles size={16} />
            AI Generator Studio
          </Link>
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            <Plus size={16} />
            New Question Bank
          </button>
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => dispatch(clearBankStatus())} />

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

      {loading && banks.length === 0 ? (
        <LoadingSpinner message="Loading question banks..." />
      ) : banks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Database size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Question Banks Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto 1.5rem' }}>
            Create your first question bank or generate questions automatically using the Gemini AI Studio.
          </p>
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={18} />
            Create First Bank
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {banks.map((bank) => (
            <div key={bank.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="badge badge-published" style={{ fontSize: '0.72rem' }}>
                  {bank.subjectArea}
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => handleOpenEdit(bank)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.35rem', borderRadius: '50%' }}
                    title="Edit Bank"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(bank)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.35rem', borderRadius: '50%' }}
                    title="Delete Bank"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{bank.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1 }}>
                Contains {bank.questionCount} {bank.questionCount === 1 ? 'question' : 'questions'}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <Link
                  to={`/instructor/ai-generator?bankId=${bank.id}`}
                  style={{
                    color: 'var(--cyan)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={14} />
                  AI Gen
                </Link>

                <Link
                  to={`/instructor/banks/${bank.id}/questions`}
                  className="btn btn-primary btn-sm"
                >
                  <BookOpen size={14} />
                  Questions ({bank.questionCount})
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Question Bank">
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Bank Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems & Microservices"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject Area</label>
            <input
              type="text"
              className="form-input"
              value={subjectArea}
              onChange={(e) => setSubjectArea(e.target.value)}
              placeholder="e.g. Computer Science, Cloud Architecture"
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Create Bank
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Question Bank">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Bank Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject Area</label>
            <input
              type="text"
              className="form-input"
              value={subjectArea}
              onChange={(e) => setSubjectArea(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Question Bank"
        message={`Are you sure you want to delete "${selectedBank?.title}"? All associated questions will be removed.`}
        confirmText="Delete Bank"
        isDanger={true}
      />
    </div>
  );
};

export default QuestionBankList;
