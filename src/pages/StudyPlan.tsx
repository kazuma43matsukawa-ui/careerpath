import { CHAT_API } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { QUALIFICATIONS } from '../data/masterData';
import './StudyPlan.css';

const SYSTEM_PROMPT = `あなたはCareerPathの学習プランナーです。
ユーザーの情報をもとに、資格取得のための具体的な週別学習プランを作成してください。

【出力形式】
- 最初に「📋 あなたの学習プラン」とタイトルを書く
- 全体サマリー（合計週数・週の学習時間）
- 週別の具体的な学習内容（1週目〜最終週まで）
- 各週に「何を・何時間・どうやって勉強するか」を具体的に書く
- 最後にモチベーションメッセージ

【注意】
- 現実的で実行可能なプランにする
- 具体的な教材名・問題集名を挙げる
- 日本語で書く
- 読みやすく改行を使う`;

interface SavedPlan {
  id: string;
  qualification_name: string;
  exam_date: string;
  weekly_hours: number;
  plan_text: string;
  created_at: string;
}

export default function StudyPlan() {
  const { state } = useAppState();
  const { user } = useAuth();
  const [selectedQualId, setSelectedQualId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [weakPoints, setWeakPoints] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [viewMode, setViewMode] = useState<'generate' | 'history'>('generate');

  const selectedQual = QUALIFICATIONS.find(q => q.id === selectedQualId);

  useEffect(() => {
    if (user) fetchSavedPlans();
  }, [user]);

  const fetchSavedPlans = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setSavedPlans(data);
  };

  const handleGenerate = async () => {
    if (!selectedQualId || !examDate) return;
    setLoading(true);
    setPlan('');
    setSaved(false);

    const today = new Date();
    const exam = new Date(examDate);
    const daysLeft = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksLeft = Math.ceil(daysLeft / 7);
    const goal = state.goals.find(g => g.qualificationId === selectedQualId);
    const loggedHours = goal ? goal.loggedMinutes / 60 : 0;
    const remainingHours = Math.max(0, (selectedQual?.totalHours || 0) - loggedHours);

    const userMessage = `
資格：${selectedQual?.name}
試験日まで：${daysLeft}日（${weeksLeft}週間）
週の学習時間：${weeklyHours}時間
既に勉強した時間：${loggedHours.toFixed(1)}時間
残りの必要学習時間：${remainingHours.toFixed(0)}時間
苦手分野・特記事項：${weakPoints || 'なし'}

上記の条件で、週別の具体的な学習プランを作成してください。`;

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
      const data = await res.json();
      if (data.error) {
        setPlan(`エラー: ${data.error.message || JSON.stringify(data.error)}`);
      } else {
        const text = data.content?.[0]?.text || `レスポンス異常: ${JSON.stringify(data)}`;
        setPlan(text);
      }
    } catch (e: any) {
      setPlan(`接続エラー: ${e.message}`);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user || !plan || !selectedQual) return;
    setSaving(true);
    const { error } = await supabase.from('study_plans').insert({
      user_id: user.id,
      qualification_id: selectedQualId,
      qualification_name: selectedQual.name,
      exam_date: examDate,
      weekly_hours: weeklyHours,
      plan_text: plan,
    });
    if (!error) {
      setSaved(true);
      fetchSavedPlans();
    }
    setSaving(false);
  };

  return (
    <div className="page study-plan-page">
      <div className="page-header">
        <div className="sp-header-row">
          <h1>📋 AI学習プラン</h1>
          <div className="sp-tabs">
            <button className={viewMode === 'generate' ? 'active' : ''} onClick={() => setViewMode('generate')}>生成</button>
            <button className={viewMode === 'history' ? 'active' : ''} onClick={() => setViewMode('history')}>保存済み {savedPlans.length > 0 && `(${savedPlans.length})`}</button>
          </div>
        </div>
      </div>

      <div className="sp-body">

        {/* 生成モード */}
        {viewMode === 'generate' && (
          <>
            {!plan ? (
              <div className="sp-form">
                <p className="sp-desc">試験情報を入力するとAIが最適な学習プランを自動生成します</p>
                <div className="sp-field">
                  <label>目標資格</label>
                  <select value={selectedQualId} onChange={e => setSelectedQualId(e.target.value)}>
                    <option value="">選択してください</option>
                    {state.goals.map(g => {
                      const q = QUALIFICATIONS.find(q => q.id === g.qualificationId);
                      return q ? <option key={g.qualificationId} value={g.qualificationId}>{q.name}</option> : null;
                    })}
                    {state.goals.length === 0 && QUALIFICATIONS.slice(0, 10).map(q => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sp-field">
                  <label>試験日（予定）</label>
                  <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="sp-field">
                  <label>週の学習時間：<strong>{weeklyHours}時間</strong></label>
                  <input type="range" min={1} max={40} value={weeklyHours} onChange={e => setWeeklyHours(Number(e.target.value))} className="sp-range" />
                  <div className="sp-range-labels"><span>1h</span><span>20h</span><span>40h</span></div>
                </div>
                <div className="sp-field">
                  <label>苦手分野・特記事項（任意）</label>
                  <textarea placeholder="例：リスニングが苦手、英語は中学レベルから" value={weakPoints} onChange={e => setWeakPoints(e.target.value)} rows={3} />
                </div>
                <button className="btn-primary" onClick={handleGenerate} disabled={!selectedQualId || !examDate || loading}>
                  {loading ? '🤖 AIがプランを作成中...' : '🚀 学習プランを生成する'}
                </button>
              </div>
            ) : (
              <div className="sp-result">
                <div className="sp-result-content">
                  {plan.split('\n').map((line, i) => (
                    <p key={i} className={
                      line.startsWith('📋') ? 'sp-title' :
                      line.startsWith('##') ? 'sp-h2' :
                      line.startsWith('#') ? 'sp-h1' :
                      line.startsWith('【') ? 'sp-section' :
                      line.startsWith('●') || line.startsWith('・') ? 'sp-item' :
                      line === '' ? 'sp-empty' : 'sp-text'
                    }>{line}</p>
                  ))}
                </div>
                <div className="sp-result-actions">
                  <button className="btn-primary" onClick={handleSave} disabled={saving || saved}>
                    {saved ? '✓ 保存しました！' : saving ? '保存中...' : '💾 このプランを保存する'}
                  </button>
                  <button className="btn-outline" style={{ marginTop: 10 }} onClick={() => { setPlan(''); setSaved(false); }}>
                    別のプランを作る
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 保存済みモード */}
        {viewMode === 'history' && (
          <div className="sp-history">
            {savedPlans.length === 0 ? (
              <div className="empty-state card">
                <p className="empty-icon">📋</p>
                <p className="empty-title">保存されたプランはありません</p>
                <p className="empty-desc">学習プランを生成して保存してください</p>
                <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setViewMode('generate')}>
                  プランを生成する
                </button>
              </div>
            ) : (
              savedPlans.map(p => (
                <div key={p.id} className="sp-saved-card card">
                  <div className="sp-saved-top">
                    <div>
                      <p className="sp-saved-name">{p.qualification_name}</p>
                      <p className="sp-saved-meta">試験日: {new Date(p.exam_date).toLocaleDateString('ja-JP')} · 週{p.weekly_hours}時間</p>
                      <p className="sp-saved-date">保存日: {new Date(p.created_at).toLocaleDateString('ja-JP')}</p>
                    </div>
                  </div>
                  <div className="sp-saved-preview">
                    {p.plan_text.slice(0, 200)}...
                  </div>
                  <button className="sp-saved-expand" onClick={() => { setPlan(p.plan_text); setViewMode('generate'); }}>
                    全文を見る →
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
