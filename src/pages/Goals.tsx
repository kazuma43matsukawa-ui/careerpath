import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { QUALIFICATIONS, CAREERS, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/masterData';
import { Qualification } from '../types';
import './Goals.css';

export default function Goals() {
  const { state, addGoal, removeGoal } = useAppState();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Qualification['category'] | 'all'>('all');

  const categories: Qualification['category'][] = ['language', 'it', 'finance', 'business'];

  const filtered = selectedCategory === 'all'
    ? QUALIFICATIONS
    : QUALIFICATIONS.filter(q => q.category === selectedCategory);

  const hasGoal = (id: string) => state.goals.some(g => g.qualificationId === id);

  const getCareerForQual = (qualId: string) =>
    CAREERS.find(c => c.qualificationIds.includes(qualId));

  return (
    <div className="page goals-page">
      <div className="page-header">
        <div className="goals-header-row">
          <h1>学習目標</h1>
          <button className="btn-add-goal" onClick={() => setShowPicker(true)}>＋ 追加</button>
        </div>
      </div>

      <div className="goals-body">
        {state.goals.length === 0 && !showPicker ? (
          <div className="empty-state card" style={{ margin: 16 }}>
            <p className="empty-icon">🎯</p>
            <p className="empty-title">目標を追加しよう</p>
            <p className="empty-desc">取得したい資格を追加すると、<br/>合格までの逆算ロードマップが作成されます</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowPicker(true)}>
              資格を選ぶ
            </button>
          </div>
        ) : (
          <div className="goals-list">
            {state.goals.map(goal => {
              const qual = QUALIFICATIONS.find(q => q.id === goal.qualificationId);
              if (!qual) return null;
              const loggedHours = goal.loggedMinutes / 60;
              const pct = Math.min(100, Math.round((loggedHours / qual.totalHours) * 100));
              const remaining = Math.max(0, qual.totalHours - loggedHours);
              const career = getCareerForQual(goal.qualificationId);

              return (
                <div key={goal.qualificationId} className="goal-detail-card card">
                  <div className="goal-detail-top">
                    <div>
                      <span className="goal-category-badge" style={{ background: CATEGORY_COLORS[qual.category] + '22', color: CATEGORY_COLORS[qual.category] }}>
                        {CATEGORY_LABELS[qual.category]}
                      </span>
                      <h3 className="goal-detail-name">{qual.name}</h3>
                    </div>
                    <button className="goal-remove" onClick={() => removeGoal(goal.qualificationId)}>✕</button>
                  </div>

                  {career && (
                    <div className="goal-career-link">
                      <span className="goal-career-arrow">↗</span>
                      <span className="goal-career-text">{career.title}</span>
                    </div>
                  )}

                  <div className="goal-stats">
                    <div className="goal-stat">
                      <p className="goal-stat-val">{loggedHours.toFixed(1)}h</p>
                      <p className="goal-stat-label">学習済み</p>
                    </div>
                    <div className="goal-stat">
                      <p className="goal-stat-val" style={{ color: 'var(--green)' }}>{Math.round(remaining)}h</p>
                      <p className="goal-stat-label">残り</p>
                    </div>
                    <div className="goal-stat">
                      <p className="goal-stat-val">{qual.totalHours}h</p>
                      <p className="goal-stat-label">合格目安</p>
                    </div>
                    <div className="goal-stat">
                      <p className="goal-stat-val">{pct}%</p>
                      <p className="goal-stat-label">達成率</p>
                    </div>
                  </div>

                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: qual.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Qualification Picker */}
        {showPicker && (
          <div className="picker-sheet">
            <div className="picker-header">
              <h2>資格を追加</h2>
              <button className="picker-close" onClick={() => setShowPicker(false)}>✕</button>
            </div>
            <div className="category-tabs">
              <button
                className={`cat-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >すべて</button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >{CATEGORY_LABELS[cat]}</button>
              ))}
            </div>
            <div className="qual-list">
              {filtered.map(qual => {
                const already = hasGoal(qual.id);
                const career = getCareerForQual(qual.id);
                return (
                  <div key={qual.id} className={`qual-item card ${already ? 'qual-item--added' : ''}`}>
                    <div className="qual-item-info">
                      <p className="qual-item-name">{qual.name}</p>
                      <p className="qual-item-sub">目安 {qual.totalHours}時間</p>
                      {career && <p className="qual-item-career">↗ {career.title}</p>}
                    </div>
                    <button
                      className={`qual-item-btn ${already ? 'qual-item-btn--added' : ''}`}
                      onClick={() => {
                        if (!already) {
                          addGoal({ qualificationId: qual.id, startDate: new Date().toISOString().split('T')[0] });
                        }
                      }}
                      disabled={already}
                    >
                      {already ? '追加済み' : '追加'}
                    </button>
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
