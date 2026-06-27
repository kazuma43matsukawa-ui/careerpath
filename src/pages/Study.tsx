import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';
import { QUALIFICATIONS } from '../data/masterData';
import './Study.css';

type Mode = 'timer' | 'pomodoro' | 'manual' | 'stats' | 'badges';

export default function Study() {
  const {
    state, elapsedSeconds,
    startTimer, stopTimer,
    addManualSession, completePomodoro,
    getStudyDates, getStreak,
    unlockedBadgeObjects,
  } = useAppState();

  const [mode, setMode] = useState<Mode>('timer');
  const [pomodoroSecs, setPomodoroSecs] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroGoalId, setPomodoroGoalId] = useState('');
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const pomodoroRef = useRef<NodeJS.Timeout | null>(null);

  // 手動記録
  const [manualGoalId, setManualGoalId] = useState('');
  const [manualHours, setManualHours] = useState(1);
  const [manualMins, setManualMins] = useState(0);
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualMemo, setManualMemo] = useState('');
  const [manualDone, setManualDone] = useState(false);

  // ポモドーロタイマー
  useEffect(() => {
    if (pomodoroRunning && pomodoroSecs > 0) {
      pomodoroRef.current = setTimeout(() => setPomodoroSecs(s => s - 1), 1000);
    } else if (pomodoroRunning && pomodoroSecs === 0) {
      if (pomodoroPhase === 'work') {
        if (pomodoroGoalId) completePomodoro(pomodoroGoalId);
        setPomodoroPhase('break');
        setPomodoroSecs(5 * 60);
      } else {
        setPomodoroPhase('work');
        setPomodoroSecs(25 * 60);
        setPomodoroRunning(false);
      }
    }
    return () => { if (pomodoroRef.current) clearTimeout(pomodoroRef.current); };
  }, [pomodoroRunning, pomodoroSecs, pomodoroPhase, pomodoroGoalId, completePomodoro]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleManualSave = () => {
    if (!manualGoalId) return;
    const totalMins = manualHours * 60 + manualMins;
    if (totalMins < 1) return;
    addManualSession(manualGoalId, totalMins, manualDate, manualMemo);
    setManualDone(true);
    setTimeout(() => { setManualDone(false); setManualMemo(''); }, 2000);
  };

  // 統計
  const totalHours = state.sessions.reduce((s, sess) => s + sess.minutes, 0) / 60;
  const streak = getStreak();
  const studyDays = getStudyDates().size;
  const todayMins = state.sessions.filter(s => s.date === new Date().toISOString().split('T')[0]).reduce((s, sess) => s + sess.minutes, 0);

  // 資格別統計
  const qualStats = state.goals.map(goal => {
    const qual = QUALIFICATIONS.find(q => q.id === goal.qualificationId);
    if (!qual) return null;
    const pct = Math.min(100, Math.round((goal.loggedMinutes / 60 / qual.totalHours) * 100));
    return { qual, loggedHours: goal.loggedMinutes / 60, pct };
  }).filter(Boolean) as { qual: typeof QUALIFICATIONS[0]; loggedHours: number; pct: number }[];

  const pomodoroProgress = pomodoroPhase === 'work'
    ? 1 - pomodoroSecs / (25 * 60)
    : 1 - pomodoroSecs / (5 * 60);

  return (
    <div className="page study-page">
      <div className="page-header">
        <h1>学習する</h1>
      </div>

      {/* モード切替 */}
      <div className="study-tabs">
        {([['timer', '⏱ タイマー'], ['pomodoro', '🍅 ポモドーロ'], ['manual', '✏️ 手動記録'], ['stats', '📊 統計'], ['badges', '🏆 バッジ']] as [Mode, string][]).map(([m, label]) => (
          <button key={m} className={`study-tab ${mode === m ? 'active' : ''}`} onClick={() => setMode(m)}>{label}</button>
        ))}
      </div>

      <div className="study-body">

        {/* ---- タイマーモード ---- */}
        {mode === 'timer' && (
          <div className="study-section">
            {!state.activeTimerGoalId ? (
              <>
                <p className="study-hint">勉強する資格を選んでタイマーを起動</p>
                {state.goals.length === 0 ? (
                  <div className="empty-state card"><p className="empty-icon">📚</p><p className="empty-title">目標を追加してください</p></div>
                ) : (
                  state.goals.map(goal => {
                    const qual = QUALIFICATIONS.find(q => q.id === goal.qualificationId);
                    if (!qual) return null;
                    const pct = Math.min(100, Math.round((goal.loggedMinutes / 60 / qual.totalHours) * 100));
                    return (
                      <button key={goal.qualificationId} className="timer-qual-btn" onClick={() => startTimer(goal.qualificationId)}>
                        <div className="tqb-color" style={{ background: qual.color }} />
                        <div className="tqb-info">
                          <p className="tqb-name">{qual.name}</p>
                          <div className="progress-bar" style={{ margin: '4px 0' }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: qual.color }} />
                          </div>
                          <p className="tqb-pct">{pct}% 完了</p>
                        </div>
                        <span className="tqb-play">▶</span>
                      </button>
                    );
                  })
                )}
              </>
            ) : (
              <div className="active-timer">
                <p className="at-name">{QUALIFICATIONS.find(q => q.id === state.activeTimerGoalId)?.name}</p>
                <div className="at-time">{formatElapsed(elapsedSeconds)}</div>
                <div className="at-ring">
                  <svg viewBox="0 0 100 100" className="at-svg">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#3db891" strokeWidth="8"
                      strokeDasharray="276.46" strokeDashoffset={276.46 * (1 - Math.min(elapsedSeconds / 3600, 1))}
                      strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <button className="btn-stop-lg" onClick={() => stopTimer()}>⏹ 終了して記録する</button>
              </div>
            )}
          </div>
        )}

        {/* ---- ポモドーロモード ---- */}
        {mode === 'pomodoro' && (
          <div className="study-section">
            <div className={`pomodoro-card ${pomodoroPhase === 'break' ? 'break-mode' : ''}`}>
              <p className="pomo-phase">{pomodoroPhase === 'work' ? '🍅 集中タイム' : '☕ 休憩タイム'}</p>
              <div className="pomo-timer-wrap">
                <svg viewBox="0 0 120 120" className="pomo-svg">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="white" strokeWidth="8"
                    strokeDasharray="326.73" strokeDashoffset={326.73 * (1 - pomodoroProgress)}
                    strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                </svg>
                <div className="pomo-time">{formatTime(pomodoroSecs)}</div>
              </div>
              <p className="pomo-count">完了: {state.pomodoroCount} 🍅</p>

              {!pomodoroGoalId && !pomodoroRunning && (
                <select className="pomo-select" value={pomodoroGoalId} onChange={e => setPomodoroGoalId(e.target.value)}>
                  <option value="">資格を選択…</option>
                  {state.goals.map(g => {
                    const q = QUALIFICATIONS.find(q => q.id === g.qualificationId);
                    return q ? <option key={g.qualificationId} value={g.qualificationId}>{q.name}</option> : null;
                  })}
                </select>
              )}

              <div className="pomo-controls">
                <button className="pomo-btn" onClick={() => setPomodoroRunning(r => !r)}>
                  {pomodoroRunning ? '⏸ 一時停止' : '▶ スタート'}
                </button>
                <button className="pomo-reset" onClick={() => {
                  setPomodoroRunning(false);
                  setPomodoroPhase('work');
                  setPomodoroSecs(25 * 60);
                }}>↺ リセット</button>
              </div>
            </div>
            <div className="pomo-tips card">
              <p className="pomo-tip-title">ポモドーロ テクニックとは？</p>
              <p className="pomo-tip-text">25分集中 → 5分休憩を繰り返す学習法。科学的に集中力と生産性が上がると証明されています。4セット完了したら長めの休憩（15〜30分）を取りましょう。</p>
            </div>
          </div>
        )}

        {/* ---- 手動記録モード ---- */}
        {mode === 'manual' && (
          <div className="study-section">
            <p className="study-hint">タイマーを使わなかった日の学習を記録できます</p>
            <div className="manual-form card">
              <div className="manual-field">
                <label>資格</label>
                <select value={manualGoalId} onChange={e => setManualGoalId(e.target.value)}>
                  <option value="">選択してください</option>
                  {state.goals.map(g => {
                    const q = QUALIFICATIONS.find(q => q.id === g.qualificationId);
                    return q ? <option key={g.qualificationId} value={g.qualificationId}>{q.name}</option> : null;
                  })}
                </select>
              </div>
              <div className="manual-field">
                <label>学習日</label>
                <input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="manual-field">
                <label>学習時間</label>
                <div className="manual-time-row">
                  <select value={manualHours} onChange={e => setManualHours(Number(e.target.value))}>
                    {Array.from({ length: 13 }, (_, i) => <option key={i} value={i}>{i}時間</option>)}
                  </select>
                  <select value={manualMins} onChange={e => setManualMins(Number(e.target.value))}>
                    {[0, 10, 15, 20, 30, 45].map(m => <option key={m} value={m}>{m}分</option>)}
                  </select>
                </div>
              </div>
              <div className="manual-field">
                <label>メモ（任意）</label>
                <input type="text" placeholder="例：過去問3回分を解いた" value={manualMemo} onChange={e => setManualMemo(e.target.value)} />
              </div>
              <button className={`btn-primary ${manualDone ? 'btn-done' : ''}`} onClick={handleManualSave} disabled={!manualGoalId || (manualHours === 0 && manualMins === 0)}>
                {manualDone ? '✓ 記録しました！' : '記録する'}
              </button>
            </div>
          </div>
        )}

        {/* ---- 統計モード ---- */}
        {mode === 'stats' && (
          <div className="study-section">
            <div className="stats-grid">
              <div className="stat-card card"><p className="stat-val">{totalHours.toFixed(1)}h</p><p className="stat-label">累計学習時間</p></div>
              <div className="stat-card card"><p className="stat-val" style={{ color: '#3db891' }}>{streak}</p><p className="stat-label">連続学習 🔥</p></div>
              <div className="stat-card card"><p className="stat-val">{studyDays}</p><p className="stat-label">学習日数</p></div>
              <div className="stat-card card"><p className="stat-val">{Math.round(todayMins)}m</p><p className="stat-label">今日の学習</p></div>
            </div>

            {qualStats.length > 0 && (
              <div className="qual-stats card">
                <p className="qs-title">資格別の進捗</p>
                {qualStats.map(({ qual, loggedHours, pct }) => (
                  <div key={qual.id} className="qs-item">
                    <div className="qs-top">
                      <span className="qs-name">{qual.name}</span>
                      <span className="qs-pct">{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ margin: '4px 0' }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: qual.color }} />
                    </div>
                    <p className="qs-hours">{loggedHours.toFixed(1)} / {qual.totalHours}h</p>
                  </div>
                ))}
              </div>
            )}

            {/* 週別グラフ */}
            <WeeklyChart sessions={state.sessions} />
          </div>
        )}

        {/* ---- バッジモード ---- */}
        {mode === 'badges' && (
          <div className="study-section">
            <p className="study-hint">学習を続けるとバッジが解除されます</p>
            <div className="badges-grid">
              {([
                ['first_study', '🚀', 'スタートダッシュ', '初めて学習を記録'],
                ['streak_3', '🔥', '3日連続', '3日連続で学習'],
                ['streak_7', '⚡', '1週間継続', '7日連続で学習'],
                ['streak_30', '💎', '1ヶ月達人', '30日連続で学習'],
                ['total_10h', '⏱️', '10時間突破', '累計10時間学習'],
                ['total_50h', '🏆', '50時間の壁', '累計50時間学習'],
                ['total_100h', '👑', '100時間マスター', '累計100時間学習'],
                ['pomodoro_10', '🍅', 'ポモドーロ職人', 'ポモドーロ10回完了'],
                ['week_commit', '🎯', '週間達成', '週間目標を達成'],
                ['multi_goal', '🌟', 'マルチチャレンジャー', '3つ以上の資格に挑戦'],
              ] as [string, string, string, string][]).map(([id, emoji, name, desc]) => {
                const unlocked = state.unlockedBadges.includes(id);
                return (
                  <div key={id} className={`badge-card card ${unlocked ? 'badge-unlocked' : 'badge-locked'}`}>
                    <span className="badge-emoji">{emoji}</span>
                    <p className="badge-name">{name}</p>
                    <p className="badge-desc">{desc}</p>
                    {unlocked && <span className="badge-check">✓ 獲得済み</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklyChart({ sessions }: { sessions: any[] }) {
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (7 - i) * 7);
    const monday = new Date(d);
    monday.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
    const label = `${monday.getMonth() + 1}/${monday.getDate()}`;
    const weekDates = Array.from({ length: 7 }, (_, j) => {
      const wd = new Date(monday);
      wd.setDate(monday.getDate() + j);
      return wd.toISOString().split('T')[0];
    });
    const totalMins = sessions.filter(s => weekDates.includes(s.date)).reduce((sum: number, s: any) => sum + s.minutes, 0);
    return { label, hours: totalMins / 60 };
  });

  const maxH = Math.max(...weeks.map(w => w.hours), 1);

  return (
    <div className="weekly-chart card">
      <p className="wc-title">週別学習時間</p>
      <div className="wc-bars">
        {weeks.map((w, i) => (
          <div key={i} className="wc-item">
            <p className="wc-val">{w.hours > 0 ? `${Math.round(w.hours * 10) / 10}h` : ''}</p>
            <div className="wc-bar-bg">
              <div className="wc-bar-fill" style={{ height: `${(w.hours / maxH) * 100}%`, background: i === 7 ? '#3db891' : '#c6ead9' }} />
            </div>
            <p className="wc-label">{w.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
