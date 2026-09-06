import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanks } from '../store/slices/questionBankSlice';
import { generateAiQuestions, clearQuestionStatus } from '../store/slices/questionSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Sparkles,
  CheckCircle,
  Database,
  ArrowRight,
  Sliders,
  AlertCircle,
  BrainCircuit,
} from 'lucide-react';

const AiQuestionGenerator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const preselectedBankId = searchParams.get('bankId');
  const { banks, loading: banksLoading } = useSelector((state) => state.questionBank);
  const { aiLoading, aiError, successMessage } = useSelector((state) => state.question);

  const [selectedBankId, setSelectedBankId] = useState(preselectedBankId || '');
  const [topic, setTopic] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('MEDIUM');
  const [count, setCount] = useState(3);
  const [generatedResults, setGeneratedResults] = useState([]);

  useEffect(() => {
    dispatch(fetchBanks());
  }, [dispatch]);

  useEffect(() => {
    if (preselectedBankId) {
      setSelectedBankId(preselectedBankId);
    } else if (banks.length > 0 && !selectedBankId) {
      setSelectedBankId(String(banks[0].id));
    }
  }, [preselectedBankId, banks, selectedBankId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedBankId) {
      alert('Please select a target Question Bank.');
      return;
    }
    if (!topic.trim()) {
      alert('Please enter a topic.');
      return;
    }

    const payload = {
      questionBankId: Number(selectedBankId),
      topic: topic.trim(),
      difficultyLevel,
      count: Number(count),
    };

    const res = await dispatch(generateAiQuestions(payload));
    if (!res.error && res.payload) {
      setGeneratedResults(res.payload);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          width: 58,
          height: 58,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: '0 0 25px rgba(139, 92, 246, 0.4)',
        }}>
          <Sparkles size={32} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
          Gemini AI Question Studio
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 580, margin: '0 auto' }}>
          Generate rigorous, high-quality multiple choice assessment questions with automated answer options and explanations powered by Google Gemini.
        </p>
      </div>

      <ErrorMessage message={aiError} onDismiss={() => dispatch(clearQuestionStatus())} />

      {/* Generator Control Panel */}
      <div className="glass-panel" style={{ padding: '2.25rem', marginBottom: '2rem' }}>
        <form onSubmit={handleGenerate}>
          {/* Target Bank */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={16} color="var(--primary)" />
              Target Question Bank
            </label>
            {banks.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                No question banks available.{' '}
                <Link to="/instructor/banks" style={{ color: 'var(--cyan)' }}>
                  Create a question bank first
                </Link>
                .
              </div>
            ) : (
              <select
                className="form-select"
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                required
              >
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.subjectArea}) — {b.questionCount} existing questions
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Topic Input */}
          <div className="form-group">
            <label className="form-label">Subject Topic & Subtopics</label>
            <input
              type="text"
              className="form-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Distributed Consensus, Raft Protocol, and Paxos comparison"
              required
            />
          </div>

          {/* Difficulty & Count */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Difficulty Level</label>
              <select
                className="form-select"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
              >
                <option value="EASY">Easy (Foundations & Syntax)</option>
                <option value="MEDIUM">Medium (Application & Logic)</option>
                <option value="HARD">Hard (Deep Theory & Edge Cases)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Number of Questions ({count})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  style={{ flex: 1, accentColor: 'var(--cyan)', cursor: 'pointer' }}
                />
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: 'var(--cyan)',
                  minWidth: 24,
                }}>
                  {count}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-cyan"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            disabled={aiLoading || banks.length === 0}
          >
            {aiLoading ? (
              <>
                <BrainCircuit size={20} className="animate-spin" />
                Gemini AI is crafting structured questions...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate & Save to Bank
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Questions Stream */}
      {generatedResults.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}>
            <h3 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={22} color="var(--emerald)" />
              {generatedResults.length} Questions Generated & Saved!
            </h3>
            <Link
              to={`/instructor/banks/${selectedBankId}/questions`}
              className="btn btn-primary btn-sm"
            >
              View in Question Bank <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {generatedResults.map((q, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-ai">
                    <Sparkles size={11} /> AI Generated
                  </span>
                  <span className={`badge ${
                    q.difficultyLevel === 'EASY' ? 'badge-easy' : q.difficultyLevel === 'HARD' ? 'badge-hard' : 'badge-medium'
                  }`}>
                    {q.difficultyLevel}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {q.questionText}
                </h4>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.6rem',
                  marginBottom: '1rem',
                }}>
                  {q.options?.map((opt, oIdx) => {
                    const isCorrect = opt.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
                    return (
                      <div
                        key={oIdx}
                        style={{
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-subtle)'}`,
                          color: isCorrect ? '#34d399' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: isCorrect ? 600 : 400,
                        }}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.825rem',
                  color: '#c7d2fe',
                }}>
                  <strong>Explanation: </strong> {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiQuestionGenerator;
