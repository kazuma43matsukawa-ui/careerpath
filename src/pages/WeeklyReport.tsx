import { CHAT_API } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { QUALIFICATIONS } from '../data/masterData';
import './WeeklyReport.css';

const REPORT_PROMPT = `あなたはCareerPathの学習コーチです。
ユーザーの先週の学習データをもとに、励ましと具体的なアドバイスを含む週次レポートを作成してください。

【出力形式】
📊 **先週の学習レポート**

✅ **良かった点**
（具体的に2〜3点）

📈 **今週の改善ポイント**
（具体的に1〜2点）

🎯 **今週のアクションプラン**
（具体的に3つ）

💪 **コーチからのメッセージ**
（モチベーションが上がる一言）

【注意】
- 日本語で書く
- 親しみやすく励ます口調
- 具体的で実行可能なアドバイス`;

interface Report {
  id: string;
  report_text: string;
  week_start: string;
  total_minutes: number;
  created_at: string;
}

export default function WeeklyReport() {
  const { state, currentWeekCommit } = useAppState();
  const { user } = useAuth();
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setReports(data);
  };

  // 先週のデータを取得
  const getLastWeekData = () => {
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - today.getDay() - 6);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    const lastWeekSessions = state.sessions.filter(s => {
      const d = new Date(s.date);
      return d >= lastMonday && d <= lastSunday;
    });

    const totalMins = lastWeekSessions.reduce((sum, s) => sum + s.minutes, 0);
    const studyDays = new Set(lastWeekSessions.map(s => s.date)).size;

    const qualStats = state.goals.map(goal => {
      const qual = QUALIFICATIONS.find(q => q.id === goal.qualificationId);
      const weekMins = lastWeekSessions.filter(s => s.qualificationId === goal.qualificationId).reduce((sum, s) => sum + s.minutes, 0);
      return { name: qual?.name || '', weekMins, totalMins: goal.loggedMinutes };
    }).filter(q => q.name);

    return { totalMins, studyDays, qualStats, weekStart: lastMonday.toISOString().split('T')[0] };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setReport('');

    const { totalMins, studyDays, qualStats, weekStart } = getLastWeekData();
    const weekTarget = currentWeekCommit?.targetHours || 10;
    const achieveRate = Math.round((totalMins / 60 / weekTarget) * 100);

    // 先週のメモを取得
    const lastMonday = new Date();
    lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() - 6);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    let memoText = '';
    if (user) {
      const { data: memos } = await supabase
        .from('study_memos')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', lastMonday.toISOString().split('T')[0])
        .lte('date', lastSunday.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (memos && memos.length > 0) {
        const moodLabels = ['つらい', '普通', '良い', '最高', '神がかり'];
        memoText = '\n\n先週の学習メモ：\n' + memos.map(m =>
          `・${m.date}（${m.qualification_name}・${Math.floor(m.study_minutes/60)}時間${m.study_minutes%60>0?`${m.study_minutes%60}分`:''}・調子:${moodLabels[m.mood]}）\n  ${m.content}`
        ).join('\n');
      }
    }

    const userMessage = `
先週の学習データ：
- 合計学習時間：${(totalMins / 60).toFixed(1)}時間
- 学習日数：${studyDays}日
- 週間目標：${weekTarget}時間
- 達成率：${achieveRate}%
- 資格別学習時間：${qualStats.map(q => `${q.name}（${(q.weekMins / 60).toFixed(1)}時間）`).join('、') || 'なし'}
- 累計学習時間：${(state.sessions.reduce((s, sess) => s + sess.minutes, 0) / 60).toFixed(1)}時間${memoText}

上記のデータをもとに週次レポートを作成してください。メモがある場合はその内容も踏まえて具体的なアドバイスをしてください。`;

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: REPORT_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || `エラー: ${JSON.stringify(data.error)}`;
      setReport(text);

      // Supabaseに保存
      if (user && !data.error) {
        await supabase.from('weekly_reports').insert({
          user_id: user.id,
          report_text: text,
          week_start: weekStart,
          total_minutes: totalMins,
        });
        fetchReports();
      }
    } catch (e: any) {
      setReport(`エラー: ${e.message}`);
    }
    setLoading(false);
  };

  const { totalMins, studyDays } = getLastWeekData();
  const weekTarget = currentWeekCommit?.targetHours || 10;
  const achieveRate = Math.min(100, Math.round((totalMins / 60 / weekTarget) * 100));

  return (
    <div className="page weekly-report-page">
      <div className="page-header">
        <div className="wr-header-row">
          <h1>📊 週次レポート</h1>
          <div className="sp-tabs">
            <button className={viewMode === 'current' ? 'active' : ''} onClick={() => setViewMode('current')}>今週</button>
            <button className={viewMode === 'history' ? 'active' : ''} onClick={() => setViewMode('history')}>履歴 {reports.length > 0 && `(${reports.length})`}</button>
          </div>
        </div>
      </div>

      <div className="wr-body">
        {viewMode === 'current' && (
          <>
            {/* 先週のサマリー */}
            <div className="wr-summary card">
              <p className="wr-summary-title">先週のサマリー</p>
              <div className="wr-stats">
                <div className="wr-stat">
                  <p className="wr-stat-val">{(totalMins / 60).toFixed(1)}h</p>
                  <p className="wr-stat-label">学習時間</p>
                </div>
                <div className="wr-stat">
                  <p className="wr-stat-val">{studyDays}</p>
                  <p className="wr-stat-label">学習日数</p>
                </div>
                <div className="wr-stat">
                  <p className="wr-stat-val" style={{ color: achieveRate >= 100 ? 'var(--green)' : 'var(--navy)' }}>{achieveRate}%</p>
                  <p className="wr-stat-label">目標達成率</p>
                </div>
              </div>
            </div>

            {!report ? (
              <div className="wr-generate">
                <p className="wr-desc">先週の学習データをAIが分析して、改善アドバイスと今週のアクションプランを提案します</p>
                <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
                  {loading ? '🤖 AIが分析中...' : '📊 週次レポートを生成する'}
                </button>
              </div>
            ) : (
              <div className="wr-result card">
                {report.split('\n').map((line, i) => (
                  <p key={i} className={
                    line.startsWith('📊') ? 'wr-title' :
                    line.startsWith('✅') || line.startsWith('📈') || line.startsWith('🎯') || line.startsWith('💪') ? 'wr-section' :
                    line.startsWith('**') ? 'wr-bold' :
                    line === '' ? 'wr-empty' : 'wr-text'
                  }>{line.replace(/\*\*/g, '')}</p>
                ))}
                <button className="btn-outline" style={{ marginTop: 16 }} onClick={() => setReport('')}>
                  再生成する
                </button>
              </div>
            )}
          </>
        )}

        {viewMode === 'history' && (
          <div className="wr-history">
            {reports.length === 0 ? (
              <div className="empty-state card">
                <p className="empty-icon">📊</p>
                <p className="empty-title">レポートがありません</p>
                <p className="empty-desc">週次レポートを生成すると自動保存されます</p>
                <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setViewMode('current')}>
                  レポートを生成する
                </button>
              </div>
            ) : (
              reports.map(r => (
                <div key={r.id} className="wr-history-card card">
                  <div className="wr-history-top">
                    <p className="wr-history-week">{new Date(r.week_start).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}の週</p>
                    <span className="badge badge-green">{(r.total_minutes / 60).toFixed(1)}h</span>
                  </div>
                  <p className="wr-history-preview">{r.report_text.slice(0, 150)}...</p>
                  <button className="wr-expand" onClick={() => { setReport(r.report_text); setViewMode('current'); }}>
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
