import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import './Commit.css';

export default function Commit() {
  const { currentWeekCommit, setWeeklyTarget, state } = useAppState();
  const [inputHours, setInputHours] = useState(currentWeekCommit?.targetHours || 10);
  const [committed, setCommitted] = useState(!!currentWeekCommit);

  const targetHours = currentWeekCommit?.targetHours || inputHours;
  const actualHours = (currentWeekCommit?.actualMinutes || 0) / 60;
  const pct = Math.min(100, Math.round((actualHours / targetHours) * 100));
  const remaining = Math.max(0, targetHours - actualHours);

  const handleCommit = () => {
    setWeeklyTarget(inputHours);
    setCommitted(true);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const target = new Date(monday);
    target.setDate(monday.getDate() + i);
    const dateStr = target.toISOString().split('T')[0];
    const mins = state.sessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.minutes, 0);
    return { label: ['月', '火', '水', '木', '金', '土', '日'][i], date: dateStr, mins };
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page commit-page">
      <div className="page-header">
        <h1>週間コミット</h1>
      </div>

      <div className="commit-body">
        <div className="commit-hero card">
          <p className="commit-week-label">今週の目標</p>

          {!committed ? (
            <>
              <p className="commit-prompt">今週は何時間勉強しますか？</p>
              <div className="commit-input-wrap">
                <button className="commit-minus" onClick={() => setInputHours(h => Math.max(1, h - 1))}>−</button>
                <div className="commit-input-display">
                  <span className="commit-input-num">{inputHours}</span>
                  <span className="commit-input-unit">時間</span>
                </div>
                <button className="commit-plus" onClick={() => setInputHours(h => Math.min(60, h + 1))}>＋</button>
              </div>
              <button className="btn-primary commit-btn" onClick={handleCommit}>
                🎯 コミットする！
              </button>
            </>
          ) : (
            <>
              <div className="commit-declared">
                <span className="commit-declared-num">{targetHours}</span>
                <span className="commit-declared-unit">時間やる！</span>
              </div>
              <div className="commit-big-donut">
                <BigDonut pct={pct} />
              </div>
              <div className="commit-progress-info">
                <div className="commit-pi-row">
                  <span className="commit-pi-label">達成</span>
                  <span className="commit-pi-val">{actualHours.toFixed(1)}h</span>
                </div>
                <div className="commit-pi-row">
                  <span className="commit-pi-label">残り</span>
                  <span className="commit-pi-val" style={{ color: 'var(--green)' }}>{remaining.toFixed(1)}h</span>
                </div>
              </div>
              {pct >= 100 && (
                <div className="commit-achieved">
                  🎉 今週の目標達成！すばらしい！
                </div>
              )}
              <button className="btn-outline" style={{ marginTop: 14 }} onClick={() => setCommitted(false)}>
                目標を変更する
              </button>
            </>
          )}
        </div>

        {/* Week calendar */}
        <div className="week-bar-section card">
          <p className="week-bar-title">今週の学習記録</p>
          <div className="week-bars">
            {weekDays.map(day => {
              const isToday = day.date === today;
              const h = day.mins / 60;
              const barPct = Math.min(100, (h / Math.max(targetHours / 5, 2)) * 100);
              return (
                <div key={day.label} className="week-bar-item">
                  <p className="week-bar-val">{day.mins > 0 ? `${Math.round(h * 10) / 10}h` : ''}</p>
                  <div className="week-bar-bg">
                    <div className="week-bar-fill" style={{ height: `${barPct}%`, background: isToday ? 'var(--green)' : '#c6ead9' }} />
                  </div>
                  <p className={`week-bar-day ${isToday ? 'today' : ''}`}>{day.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivation message */}
        <div className="motivation-card card">
          <p className="motivation-icon">💪</p>
          <p className="motivation-text">
            {pct === 0
              ? '今日から始めよう！最初の一歩が一番大切。'
              : pct < 50
              ? `${Math.round(remaining * 10) / 10}時間で達成！コツコツ積み上げよう。`
              : pct < 100
              ? `もう少し！あと${Math.round(remaining * 10) / 10}時間で今週の目標達成！`
              : '今週の目標を達成！来週も頑張ろう！'}
          </p>
        </div>
      </div>
    </div>
  );
}

function BigDonut({ pct }: { pct: number }) {
  const r = 60;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="#3db891" strokeWidth="12"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="70" y="64" textAnchor="middle" fontSize="26" fontWeight="700" fill="#1a2744">{pct}%</text>
      <text x="70" y="82" textAnchor="middle" fontSize="12" fill="#9ca3af">達成率</text>
    </svg>
  );
}
