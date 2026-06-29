import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { QUALIFICATIONS } from '../data/masterData';
import { useAppState } from '../hooks/useAppState';
import './StudyMemo.css';

interface Memo {
  id: string;
  date: string;
  qualification_id: string;
  qualification_name: string;
  content: string;
  study_minutes: number;
  mood: number;
  created_at: string;
}

const MOODS = ['😴', '😐', '😊', '🔥', '⚡'];
const MOOD_LABELS = ['つらい', '普通', '良い', '最高', '神がかり'];

export default function StudyMemo() {
  const { user } = useAuth();
  const { state } = useAppState();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [qualId, setQualId] = useState('');
  const [content, setContent] = useState('');
  const [studyMins, setStudyMins] = useState(60);
  const [mood, setMood] = useState(2);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) fetchMemos();
  }, [user]);

  const fetchMemos = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('study_memos')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (data) setMemos(data);
  };

  const handleSave = async () => {
    if (!user || !content || !qualId) return;
    setSaving(true);
    const qual = QUALIFICATIONS.find(q => q.id === qualId);
    const { error } = await supabase.from('study_memos').insert({
      user_id: user.id,
      date,
      qualification_id: qualId,
      qualification_name: qual?.name || '',
      content,
      study_minutes: studyMins,
      mood,
    });
    if (!error) {
      setContent('');
      setShowForm(false);
      fetchMemos();
    }
    setSaving(false);
  };

  const filteredMemos = filter === 'all' ? memos : memos.filter(m => m.qualification_id === filter);
  const qualOptions = [...new Set(memos.map(m => m.qualification_id))].map(id => ({
    id, name: QUALIFICATIONS.find(q => q.id === id)?.name || id
  }));

  return (
    <div className="page memo-page">
      <div className="page-header">
        <div className="memo-header-row">
          <h1>📝 学習メモ</h1>
          <button className="memo-add-btn" onClick={() => setShowForm(true)}>＋ 追加</button>
        </div>
      </div>

      <div className="memo-body">

        {/* メモ追加フォーム */}
        {showForm && (
          <div className="memo-form card">
            <div className="memo-form-header">
              <h3>今日の学習を記録</h3>
              <button className="memo-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="memo-field">
              <label>日付</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="memo-field">
              <label>資格</label>
              <select value={qualId} onChange={e => setQualId(e.target.value)}>
                <option value="">選択してください</option>
                {state.goals.map(g => {
                  const q = QUALIFICATIONS.find(q => q.id === g.qualificationId);
                  return q ? <option key={g.qualificationId} value={g.qualificationId}>{q.name}</option> : null;
                })}
              </select>
            </div>

            <div className="memo-field">
              <label>学習時間：<strong>{Math.floor(studyMins / 60)}時間{studyMins % 60 > 0 ? `${studyMins % 60}分` : ''}</strong></label>
              <input type="range" min={15} max={480} step={15} value={studyMins} onChange={e => setStudyMins(Number(e.target.value))} className="sp-range" />
            </div>

            <div className="memo-field">
              <label>今日の調子</label>
              <div className="mood-selector">
                {MOODS.map((emoji, i) => (
                  <button key={i} className={`mood-btn ${mood === i ? 'active' : ''}`} onClick={() => setMood(i)}>
                    <span className="mood-emoji">{emoji}</span>
                    <span className="mood-label">{MOOD_LABELS[i]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="memo-field">
              <label>今日やったこと・気づき</label>
              <textarea
                placeholder="例：過去問10問解いた。リスニングPart2が苦手だと判明。明日は集中して練習する。"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
              />
            </div>

            <button className="btn-primary" onClick={handleSave} disabled={!content || !qualId || saving}>
              {saving ? '保存中...' : '💾 メモを保存する'}
            </button>
          </div>
        )}

        {/* フィルター */}
        {memos.length > 0 && (
          <div className="memo-filter">
            <button className={`memo-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>すべて</button>
            {qualOptions.map(q => (
              <button key={q.id} className={`memo-filter-btn ${filter === q.id ? 'active' : ''}`} onClick={() => setFilter(q.id)}>{q.name}</button>
            ))}
          </div>
        )}

        {/* メモ一覧 */}
        {filteredMemos.length === 0 ? (
          <div className="empty-state card">
            <p className="empty-icon">📝</p>
            <p className="empty-title">メモがありません</p>
            <p className="empty-desc">毎日の学習を記録して振り返りに活かそう</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>最初のメモを書く</button>
          </div>
        ) : (
          filteredMemos.map(memo => (
            <div key={memo.id} className="memo-card card">
              <div className="memo-card-top">
                <div className="memo-card-left">
                  <span className="memo-mood">{MOODS[memo.mood]}</span>
                  <div>
                    <p className="memo-qual">{memo.qualification_name}</p>
                    <p className="memo-date">{new Date(memo.date + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}</p>
                  </div>
                </div>
                <span className="memo-time">{Math.floor(memo.study_minutes / 60)}h{memo.study_minutes % 60 > 0 ? `${memo.study_minutes % 60}m` : ''}</span>
              </div>
              <p className="memo-content">{memo.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
