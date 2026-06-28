import React, { useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { QUALIFICATIONS } from '../data/masterData';
import './Dashboard.css';

interface Props {
  onNavigate: (page: string) => void;
  onShowPremium: () => void;
}

export default function Dashboard({ onNavigate, onShowPremium }: Props) {
  const { state, elapsedSeconds, startTimer, stopTimer, currentWeekCommit, getStreak } = useAppState();

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
  const streak = getStreak();
  const totalHours = state.sessions.reduce((s, sess) => s + sess.minutes, 0) / 60;
  const todayMins = state.sessions.filter(s => s.date === new Date().toISOString().split('T')[0]).reduce((s, sess) => s + sess.minutes, 0);

  const activeQual = state.activeTimerGoalId
    ? QUALIFICATIONS.find(q => q.id === state.activeTimerGoalId)
    : null;

  const hour = new Date().getHours();
  const greeting = hour < 10 ? 'おはようございます' : hour < 17 ? 'こんにちは' : 'おつかれさまです';

  return (
    <div className="page dashboard">
      <div className="dash-header">
        <div className="dash-header-inner">
          <div>
            <p className="dash-greeting">{greeting} 👋</p>
            <h1 className="dash-title">マイダッシュボード</h1>
          </div>
          <div className="dash-date">
            {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
          </div>
        </div>
      </div>

      <div className="dash-body">

        {/* 今日の統計 */}
        <div className="today-stats">
          <div className="today-stat">
            <p className="today-stat-val">{Math.round(todayMins)}m</p>
            <p className="today-stat-label">今日の学習</p>
          </div>
          <div className="today-stat">
            <p className="today-stat-val" style={{ color: 'var(--green)' }}>{streak}</p>
            <p className="today-stat-label">連続日数 🔥</p>
          </div>
          <div className="today-stat">
            <p className="today-stat-val">{totalHours.toFixed(0)}h</p>
            <p className="today-stat-label">累計学習</p>
          </div>
        </div>

        {/* Weekly Commit Card */}
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
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${weekPct}%`, background: 'linear-gradient(90deg, var(--green), #1db87a)' }} />
          </div>
          <p className="commit-remaining">
            {weekPct >= 100 ? '🎉 今週の目標達成！' : `あと ${(weekTargetHours - weekActualHours).toFixed(1)}時間で達成`}
          </p>
        </div>

        {/* Timer */}
        {state.activeTimerGoalId ? (
          <div className="timer-card card timer-card--active">
            <p className="timer-qual-name">{activeQual?.name}</p>
            <p className="timer-elapsed">{formatTime(elapsedSeconds)}</p>
            <button className="btn-stop" onClick={() => stopTimer()}>⏹ 学習を終了する</button>
          </div>
        ) : (
          state.goals.length > 0 && (
            <div className="start-study card">
              <p className="start-label">今日の学習をはじめる</p>
              <div className="start-list">
                {state.goals.map(goal => {
                  const qual = QUALIFICATIONS.find(q => q.id === goal.qualificationId);
                  if (!qual) return null;
                  const pct = Math.min(100, Math.round((goal.loggedMinutes / 60 / qual.totalHours) * 100));
                  return (
                    <button key={goal.qualificationId} className="start-item" onClick={() => startTimer(goal.qualificationId)}>
                      <div>
                        <p className="start-item-name">{qual.name}</p>
                        <p className="start-item-sub">{pct}% 完了 · あと{Math.round(Math.max(0, qual.totalHours - goal.loggedMinutes / 60))}h</p>
                      </div>
                      <span className="start-item-play">▶</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Goals */}
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
                  <div className="progress-bar">
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
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#e8eef5" strokeWidth="7" />
      <circle cx="30" cy="30" r={r} fill="none" stroke="url(#grad)" strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 30 30)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2ec98a" />
          <stop offset="100%" stopColor="#1db87a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
