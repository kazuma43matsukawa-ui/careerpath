import React, { useState } from 'react';
import { QUALIFICATIONS, CAREERS, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/masterData';
import { useAppState } from '../hooks/useAppState';
import './Onboarding.css';

interface Props {
  onComplete: () => void;
}

type Step = 'welcome' | 'career' | 'qualifications' | 'hours' | 'done';

const CUSTOM_CAREER_ID = 'custom';

export default function Onboarding({ onComplete }: Props) {
  const { addGoal, setWeeklyTarget } = useAppState();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [customCareer, setCustomCareer] = useState('');
  const [selectedQualIds, setSelectedQualIds] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedCareer = CAREERS.find(c => c.id === selectedCareerId);

  // キャリア選択時に関連資格を自動プリセット
  const handleCareerSelect = (careerId: string) => {
    setSelectedCareerId(careerId);
    if (careerId !== CUSTOM_CAREER_ID) {
      const career = CAREERS.find(c => c.id === careerId);
      if (career) setSelectedQualIds(career.qualificationIds);
    } else {
      setSelectedQualIds([]);
    }
  };

  const toggleQual = (id: string) => {
    setSelectedQualIds(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    selectedQualIds.forEach(id => {
      addGoal({ qualificationId: id, startDate: new Date().toISOString().split('T')[0] });
    });
    setWeeklyTarget(weeklyHours);
    onComplete();
  };

  const categories = ['all', 'language', 'it', 'finance', 'business'] as const;
  const filteredQuals = activeCategory === 'all'
    ? QUALIFICATIONS
    : QUALIFICATIONS.filter(q => q.category === activeCategory);

  return (
    <div className="onboarding">

      {/* ---- STEP: welcome ---- */}
      {step === 'welcome' && (
        <div className="ob-screen ob-welcome">
          <div className="ob-welcome-top">
            <div className="ob-logo">C</div>
            <h1>CareerPathへ<br/>ようこそ！</h1>
            <p>3つの質問に答えるだけで、<br/>あなただけの<strong>逆算ロードマップ</strong>を作ります。</p>
          </div>
          <div className="ob-welcome-steps">
            {[
              { icon: '🎯', label: 'なりたい自分を選ぶ' },
              { icon: '📚', label: '取りたい資格を選ぶ' },
              { icon: '⏰', label: '週の学習時間を決める' },
            ].map((s, i) => (
              <div key={i} className="ob-step-item">
                <span className="ob-step-icon">{s.icon}</span>
                <span className="ob-step-label">{s.label}</span>
              </div>
            ))}
          </div>
          <button className="ob-btn-primary" onClick={() => setStep('career')}>
            はじめる →
          </button>
          <button className="ob-skip" onClick={onComplete}>スキップ</button>
        </div>
      )}

      {/* ---- STEP: career ---- */}
      {step === 'career' && (
        <div className="ob-screen">
          <div className="ob-header">
            <div className="ob-progress">
              <div className="ob-progress-fill" style={{ width: '33%' }} />
            </div>
            <p className="ob-step-num">1 / 3</p>
            <h2>将来、どんな自分に<br/>なりたいですか？</h2>
            <p className="ob-sub">資格取得の「その先」にあるキャリアから逆算します</p>
          </div>

          <div className="ob-career-list">
            {CAREERS.map(career => (
              <button
                key={career.id}
                className={`ob-career-card ${selectedCareerId === career.id ? 'selected' : ''}`}
                onClick={() => handleCareerSelect(career.id)}
              >
                <div className="ob-career-info">
                  <p className="ob-career-title">{career.title}</p>
                  <p className="ob-career-desc">{career.description}</p>
                  <div className="ob-career-quals">
                    {career.qualificationIds.map(qid => {
                      const q = QUALIFICATIONS.find(q => q.id === qid);
                      return q ? (
                        <span key={qid} className="ob-qual-tag">{q.name}</span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className={`ob-check ${selectedCareerId === career.id ? 'checked' : ''}`}>
                  {selectedCareerId === career.id ? '✓' : ''}
                </div>
              </button>
            ))}

            {/* まだ決まっていない */}
            <button
              className={`ob-career-card ob-career-custom ${selectedCareerId === CUSTOM_CAREER_ID ? 'selected' : ''}`}
              onClick={() => handleCareerSelect(CUSTOM_CAREER_ID)}
            >
              <div className="ob-career-info">
                <p className="ob-career-title">まだ決まっていない</p>
                <p className="ob-career-desc">資格から先に決めてOK！後でキャリアを設定できます</p>
              </div>
              <div className={`ob-check ${selectedCareerId === CUSTOM_CAREER_ID ? 'checked' : ''}`}>
                {selectedCareerId === CUSTOM_CAREER_ID ? '✓' : ''}
              </div>
            </button>
          </div>

          <div className="ob-footer">
            <button
              className="ob-btn-primary"
              disabled={!selectedCareerId}
              onClick={() => setStep('qualifications')}
            >
              次へ →
            </button>
          </div>
        </div>
      )}

      {/* ---- STEP: qualifications ---- */}
      {step === 'qualifications' && (
        <div className="ob-screen">
          <div className="ob-header">
            <div className="ob-progress">
              <div className="ob-progress-fill" style={{ width: '66%' }} />
            </div>
            <p className="ob-step-num">2 / 3</p>
            <h2>取りたい資格を<br/>選んでください</h2>
            <p className="ob-sub">複数選択OK・後からでも追加できます</p>
          </div>

          {/* キャリアに関連する資格をハイライト */}
          {selectedCareer && (
            <div className="ob-recommended">
              <p className="ob-rec-label">✨ {selectedCareer.title} におすすめ</p>
              <div className="ob-rec-quals">
                {selectedCareer.qualificationIds.map(qid => {
                  const q = QUALIFICATIONS.find(q => q.id === qid);
                  if (!q) return null;
                  return (
                    <button
                      key={qid}
                      className={`ob-rec-qual ${selectedQualIds.includes(qid) ? 'selected' : ''}`}
                      onClick={() => toggleQual(qid)}
                    >
                      {selectedQualIds.includes(qid) ? '✓ ' : ''}{q.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* カテゴリタブ */}
          <div className="ob-category-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`ob-cat-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'すべて' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* 資格リスト */}
          <div className="ob-qual-list">
            {filteredQuals.map(qual => {
              const selected = selectedQualIds.includes(qual.id);
              return (
                <button
                  key={qual.id}
                  className={`ob-qual-item ${selected ? 'selected' : ''}`}
                  onClick={() => toggleQual(qual.id)}
                >
                  <div className="ob-qual-color" style={{ background: qual.color }} />
                  <div className="ob-qual-info">
                    <p className="ob-qual-name">{qual.name}</p>
                    <p className="ob-qual-hours">目安 {qual.totalHours}時間</p>
                  </div>
                  <div className={`ob-check ${selected ? 'checked' : ''}`}>
                    {selected ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="ob-footer">
            <p className="ob-selected-count">
              {selectedQualIds.length > 0 ? `${selectedQualIds.length}個選択中` : ''}
            </p>
            <button
              className="ob-btn-primary"
              disabled={selectedQualIds.length === 0}
              onClick={() => setStep('hours')}
            >
              次へ →
            </button>
            <button className="ob-back" onClick={() => setStep('career')}>← 戻る</button>
          </div>
        </div>
      )}

      {/* ---- STEP: hours ---- */}
      {step === 'hours' && (
        <div className="ob-screen ob-hours-screen">
          <div className="ob-header">
            <div className="ob-progress">
              <div className="ob-progress-fill" style={{ width: '100%' }} />
            </div>
            <p className="ob-step-num">3 / 3</p>
            <h2>今週は何時間<br/>勉強できそうですか？</h2>
            <p className="ob-sub">無理のない時間から始めましょう。後から変更できます</p>
          </div>

          <div className="ob-hours-picker">
            <button className="ob-hours-btn" onClick={() => setWeeklyHours(h => Math.max(1, h - 1))}>−</button>
            <div className="ob-hours-display">
              <span className="ob-hours-num">{weeklyHours}</span>
              <span className="ob-hours-unit">時間 / 週</span>
            </div>
            <button className="ob-hours-btn" onClick={() => setWeeklyHours(h => Math.min(60, h + 1))}>＋</button>
          </div>

          {/* 目安メッセージ */}
          <div className="ob-hours-hint">
            {weeklyHours <= 3 && <p>🌱 週3時間以下。無理なく継続が大切！まず習慣づけから。</p>}
            {weeklyHours >= 4 && weeklyHours <= 7 && <p>📚 週4〜7時間。コツコツ派！着実に積み上げられます。</p>}
            {weeklyHours >= 8 && weeklyHours <= 14 && <p>🔥 週8〜14時間。本気モード！目標達成が見えてきます。</p>}
            {weeklyHours >= 15 && <p>⚡ 週15時間以上。超本気！無理しすぎず続けることが大事。</p>}
          </div>

          {/* 選択した資格の達成目安 */}
          <div className="ob-estimation">
            <p className="ob-est-title">このペースだと…</p>
            {selectedQualIds.slice(0, 3).map(qid => {
              const q = QUALIFICATIONS.find(q => q.id === qid);
              if (!q) return null;
              const weeks = Math.ceil(q.totalHours / weeklyHours);
              const months = Math.ceil(weeks / 4);
              return (
                <div key={qid} className="ob-est-item">
                  <span className="ob-est-name">{q.name}</span>
                  <span className="ob-est-time">約{months}ヶ月で合格圏</span>
                </div>
              );
            })}
          </div>

          <div className="ob-footer">
            <button className="ob-btn-primary" onClick={() => setStep('done')}>
              設定を完了する →
            </button>
            <button className="ob-back" onClick={() => setStep('qualifications')}>← 戻る</button>
          </div>
        </div>
      )}

      {/* ---- STEP: done ---- */}
      {step === 'done' && (
        <div className="ob-screen ob-done">
          <div className="ob-done-content">
            <div className="ob-done-icon">🎯</div>
            <h2>ロードマップが<br/>完成しました！</h2>
            <p>あとは毎日コツコツ積み上げるだけ。<br/>CareerPathが全力でサポートします。</p>

            <div className="ob-done-summary">
              {selectedCareer && (
                <div className="ob-done-row">
                  <span className="ob-done-label">目標キャリア</span>
                  <span className="ob-done-val">{selectedCareer.title}</span>
                </div>
              )}
              <div className="ob-done-row">
                <span className="ob-done-label">取得資格</span>
                <span className="ob-done-val">{selectedQualIds.length}個</span>
              </div>
              <div className="ob-done-row">
                <span className="ob-done-label">週間目標</span>
                <span className="ob-done-val">{weeklyHours}時間</span>
              </div>
            </div>

            <button className="ob-btn-primary ob-btn-start" onClick={handleComplete}>
              学習をはじめる 🚀
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
