import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

const QuizTimer = ({ totalMinutes, onTimeUp, startedAt }) => {
  const calculateInitialSeconds = () => {
    if (!startedAt) return totalMinutes * 60;
    const startMs = new Date(startedAt).getTime();
    const nowMs = Date.now();
    const elapsedSeconds = Math.floor((nowMs - startMs) / 1000);
    const totalSeconds = totalMinutes * 60;
    return Math.max(0, totalSeconds - elapsedSeconds);
  };

  const [secondsRemaining, setSecondsRemaining] = useState(calculateInitialSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = secondsRemaining < 120; // under 2 mins
  const isWarning = secondsRemaining < 300; // under 5 mins

  let statusColor = 'var(--cyan)';
  let borderColor = 'rgba(6, 182, 212, 0.4)';
  let bgGradient = 'rgba(6, 182, 212, 0.1)';

  if (isUrgent) {
    statusColor = 'var(--rose)';
    borderColor = 'rgba(244, 63, 94, 0.6)';
    bgGradient = 'rgba(244, 63, 94, 0.15)';
  } else if (isWarning) {
    statusColor = 'var(--amber)';
    borderColor = 'rgba(245, 158, 11, 0.5)';
    bgGradient = 'rgba(245, 158, 11, 0.12)';
  }

  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / (totalMinutes * 60)) * 100));

  return (
    <div
      className={isUrgent ? 'timer-urgency' : ''}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.5rem 1.15rem',
        background: bgGradient,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.3s ease',
      }}
    >
      <Clock size={20} color={statusColor} />
      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '1.25rem',
          fontWeight: 700,
          color: statusColor,
          letterSpacing: '0.05em',
        }}>
          {formattedTime}
        </div>
        <div style={{
          height: 3,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          marginTop: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: statusColor,
            transition: 'width 1s linear',
          }} />
        </div>
      </div>
    </div>
  );
};

export default QuizTimer;
