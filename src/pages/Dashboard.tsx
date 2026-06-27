import React, { useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { QUALIFICATIONS } from '../data/masterData';
import './Dashboard.css';

interface Props {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { state, elapsedSeconds, startTimer, stopTimer, currentWeekCommit } = useAppState();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const weekActualHours = currentWeekCommit ? currentWeekCommit.actualMinutes / 60 : 0;
  const weekTargetHours = currentWeekCommit?.targetHours || 10;
  const weekPct = Math.min(100, Math.round((weekActualHours / weekTargetHours) * 100));

  const activeQual = state.activeTimerGoalId
    ? QUALIFICATIONS.find(q => q.id === state.activeTimerGoalId)
    : null;

  return (
    <div className="page dashboard">
      <div className="dash-header">
        <div className="dash-header-inner">
          <div>
            <p className="dash-greeting">おはようございます</p>
            <h1 className="dash-title">マイダッシュボード</h1>
          </div>
          <div className="dash-date">{new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}</div>
        </div>
      </div>

      <div className="dash-body">
        <div className="commit-card card">
          <div className="commit-card-top">
            <div>
              <p className="commit-label">今週のコミット</p>
              <p className="commit-hours">
                <span className="commit-done">{weekActualHours.toFixed(1)}</span>
                <span className="commit-sep"> / </span>
                <span className="commit-target">{weekTargetHours}h</span>
              </p>
            </div>
            <div className="commit-donut-wrap">
              <DonutChart pct={weekPct} />
              <span className="commit-pct-label">{weekPct}%</span>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: `${weekPct}%`, background: 'var(--green)' }} />
          </div>
          <p className="commit-remaining">
            {weekPct >= 100
              ? '今週の目標達成！'
              : `あと ${(weekTargetHours - weekActualHours).toFixed(1)}時間で達成`}
          </p>
        </div>

        {state.activeTimerGoalId ? (
          <div className="timer-card card timer-card--active">
            <p className="timer-qual-name">{activeQual?.name}</p>
            <p className="timer-elapsed">{formatTime(elapsedSeconds)}</p>
            <button className="btn-stop" onClick={() => stopTimer()}>学習を終了する</button>
          </div>
        ) : (
          state.goals.length > 0 && (
            <div className="start-study card">
              <p className="start-label">どの資格を勉強しますか？</p>
              <div className="start-list">
                {state.goals.map(goal => {
                  const qual = QUALIFICATIONS.find(q => q.id === goal.qualificationId);
                  if (!qual) return null;
                  const pct = Math.min(100, Math.round((goal.loggedMinutes / 60 / qual.totalHours) * 100));
                  return (
                    <button key={goal.qualificationId} className="start-item" onClick={() => startTimer(goal.qualificationId)}>
                      <div>
                        <p className="start-item-name">{qual.name}</p>
                        <p className="start-item-sub">{pct}% 完了</p>
                      </div>
                      <span className="start-item-play">▶</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}

        <div className="goals-section">
          <div className="section-head">
            <p className="section-title">学習目標</p>
            <button className="section-link" onClick={() => onNavigate('goals')}>すべて見る</button>
          </div>
          {state.goals.length === 0 ? (
            <div className="empty-state card">
              <p className="empty-icon">🎯</p>
              <p className="empty-title">目標を追加しよう</p>
              <p className="empty-desc">資格とキャリア目標を設定すると、逆算ロードマップが作成されます</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => onNavigate('goals')}>目標を追加する</button>
            </div>
          ) : (
            state.goals.slice(0, 3).map(goal => {
              const qual = QUALIFICATIONS.find(q => q.id === goal.qualificationId);
              if (!qual) return null;
              const loggedHours = goal.loggedMinutes / 60;
              const pct = Math.min(100, Math.round((loggedHours / qual.totalHours) * 100));
              const remaining = Math.max(0, qual.totalHours - loggedHours);
              return (
                <div key={goal.qualificationId} className="goal-card card">
                  <div className="goal-card-top">
                    <p className="goal-name">{qual.name}</p>
                    <span className="badge badge-green">あと{Math.round(remaining)}h</span>
                  </div>
                  <div className="progress-bar" style={{ margin: '8px 0' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: qual.color }} />
                  </div>
                  <div className="goal-card-bottom">
                    <span className="goal-logged">{loggedHours.toFixed(1)} / {qual.totalHours}h</span>
                    <span className="goal-pct">{pct}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ pct }: { pct: number }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="#3db891" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
    </svg>
  );
}
