import React, { useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { QUALIFICATIONS } from '../data/masterData';
import './Calendar.css';

export default function Calendar() {
  const { state, getStudyDates } = useAppState();

  const studyDates = getStudyDates();

  const calendarData = useMemo(() => {
    const weeks: string[][] = [];
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83); // 12 weeks back

    // Align to Monday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - (startDay === 0 ? 6 : startDay - 1));

    let week: string[] = [];
    const cur = new Date(startDate);
    while (cur <= endDate) {
      week.push(cur.toISOString().split('T')[0]);
      if (week.length === 7) { weeks.push(week); week = []; }
      cur.setDate(cur.getDate() + 1);
    }
    if (week.length) weeks.push(week);
    return weeks;
  }, []);

  const getMinutesForDate = (date: string) => {
    return state.sessions.filter(s => s.date === date).reduce((sum, s) => sum + s.minutes, 0);
  };

  const getIntensity = (minutes: number) => {
    if (minutes === 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 120) return 3;
    return 4;
  };

  const intensityColors = ['#e2e8f0', '#c6ead9', '#9fd4ba', '#3db891', '#0f6e4a'];

  const totalHours = state.sessions.reduce((sum, s) => sum + s.minutes, 0) / 60;
  const studyDaysCount = studyDates.size;
  const streakDays = useMemo(() => {
    let streak = 0;
    const today = new Date();
    const cur = new Date(today);
    while (true) {
      const d = cur.toISOString().split('T')[0];
      if (studyDates.has(d)) { streak++; cur.setDate(cur.getDate() - 1); }
      else break;
    }
    return streak;
  }, [studyDates]);

  const weekDayLabels = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <div className="page calendar-page">
      <div className="page-header">
        <h1>学習カレンダー</h1>
      </div>

      <div className="cal-body">
        {/* Stats row */}
        <div className="cal-stats">
          <div className="cal-stat card">
            <p className="cal-stat-val">{totalHours.toFixed(0)}h</p>
            <p className="cal-stat-label">累計学習</p>
          </div>
          <div className="cal-stat card">
            <p className="cal-stat-val">{studyDaysCount}</p>
            <p className="cal-stat-label">学習日数</p>
          </div>
          <div className="cal-stat card">
            <p className="cal-stat-val" style={{ color: 'var(--green)' }}>{streakDays}</p>
            <p className="cal-stat-label">連続日数 🔥</p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="heatmap-section card">
          <p className="heatmap-title">勉強した日が、色づく。</p>
          <div className="heatmap-wrap">
            <div className="heatmap-day-labels">
              {weekDayLabels.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="heatmap-grid">
              {calendarData.map((week, wi) => (
                <div key={wi} className="heatmap-week">
                  {week.map(date => {
                    const mins = getMinutesForDate(date);
                    const intensity = getIntensity(mins);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    return (
                      <div
                        key={date}
                        className={`heatmap-cell ${isToday ? 'heatmap-cell--today' : ''}`}
                        style={{ background: intensityColors[intensity] }}
                        title={`${date}: ${mins}分`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="heatmap-legend">
            <span className="legend-label">少ない</span>
            {intensityColors.map((c, i) => (
              <div key={i} className="legend-cell" style={{ background: c }} />
            ))}
            <span className="legend-label">多い</span>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="sessions-section">
          <p className="section-title" style={{ padding: '0 16px', marginBottom: 10 }}>最近の学習記録</p>
          {state.sessions.length === 0 ? (
            <div className="empty-state card" style={{ margin: '0 16px' }}>
              <p className="empty-icon">📚</p>
              <p className="empty-title">まだ記録がありません</p>
              <p className="empty-desc">タイマーを使って学習を記録しよう</p>
            </div>
          ) : (
            [...state.sessions].reverse().slice(0, 20).map(session => {
              const qual = QUALIFICATIONS.find(q => q.id === session.qualificationId);
              return (
                <div key={session.id} className="session-item">
                  <div className="session-dot" style={{ background: qual?.color || '#ccc' }} />
                  <div className="session-info">
                    <p className="session-name">{qual?.name || '不明'}</p>
                    <p className="session-date">{new Date(session.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
                  </div>
                  <p className="session-mins">{session.minutes >= 60 ? `${Math.floor(session.minutes / 60)}h${session.minutes % 60 > 0 ? `${session.minutes % 60}m` : ''}` : `${session.minutes}m`}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
