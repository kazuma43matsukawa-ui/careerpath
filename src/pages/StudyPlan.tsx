import { CHAT_API } from '../lib/api';
import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
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

export default function StudyPlan() {
  const { state } = useAppState();
  const [selectedQualId, setSelectedQualId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [weakPoints, setWeakPoints] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedQual = QUALIFICATIONS.find(q => q.id === selectedQualId);

  const handleGenerate = async () => {
    if (!selectedQualId || !examDate) return;
    setLoading(true);
    setPlan('');

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

  return (
    <div className="page study-plan-page">
      <div className="page-header">
        <h1>📋 AI学習プラン生成</h1>
      </div>

      <div className="sp-body">
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
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="sp-field">
              <label>週の学習時間：<strong>{weeklyHours}時間</strong></label>
              <input
                type="range"
                min={1} max={40} value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                className="sp-range"
              />
              <div className="sp-range-labels">
                <span>1h</span><span>20h</span><span>40h</span>
              </div>
            </div>

            <div className="sp-field">
              <label>苦手分野・特記事項（任意）</label>
              <textarea
                placeholder="例：リスニングが苦手、英語は中学レベルから"
                value={weakPoints}
                onChange={e => setWeakPoints(e.target.value)}
                rows={3}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={!selectedQualId || !examDate || loading}
            >
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
            <div className="sp-actions">
              <button className="btn-primary" onClick={() => setPlan('')}>
                別のプランを作る
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
