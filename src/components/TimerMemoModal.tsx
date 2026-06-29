import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { QUALIFICATIONS } from '../data/masterData';
import './TimerMemoModal.css';

interface Props {
  qualificationId: string;
  studyMinutes: number;
  onClose: () => void;
}

const MOODS = ['😴', '😐', '😊', '🔥', '⚡'];
const MOOD_LABELS = ['つらい', '普通', '良い', '最高', '神がかり'];

export default function TimerMemoModal({ qualificationId, studyMinutes, onClose }: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(2);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const qual = QUALIFICATIONS.find(q => q.id === qualificationId);

  const handleSave = async () => {
    if (!user) { onClose(); return; }
    setSaving(true);
    await supabase.from('study_memos').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      qualification_id: qualificationId,
      qualification_name: qual?.name || '',
      content: content || '（メモなし）',
      study_minutes: studyMinutes,
      mood,
    });
    setSaving(false);
    setDone(true);
    setTimeout(onClose, 1500);
  };

  if (done) {
    return (
      <div className="tmm-overlay">
        <div className="tmm-modal">
          <div className="tmm-done">
            <p className="tmm-done-icon">✅</p>
            <p className="tmm-done-text">メモを保存しました！</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tmm-overlay">
      <div className="tmm-modal">
        <div className="tmm-header">
          <div>
            <p className="tmm-congrats">お疲れ様でした！🎉</p>
            <p className="tmm-stats">{qual?.name} · {Math.floor(studyMinutes / 60) > 0 ? `${Math.floor(studyMinutes / 60)}時間` : ''}{studyMinutes % 60 > 0 ? `${studyMinutes % 60}分` : ''}</p>
          </div>
        </div>

        <div className="tmm-body">
          <div className="tmm-field">
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

          <div className="tmm-field">
            <label>今日やったこと・気づき（任意）</label>
            <textarea
              placeholder="例：過去問10問解いた。Part2が苦手と判明。"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
              autoFocus
            />
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '💾 保存して終わる'}
          </button>
          <button className="tmm-skip" onClick={onClose}>スキップ</button>
        </div>
      </div>
    </div>
  );
}
