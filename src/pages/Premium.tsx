import { CHECKOUT_API } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Premium.css';

interface Props {
  onClose: () => void;
}

export default function Premium({ onClose }: Props) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(CHECKOUT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('エラーが発生しました。もう一度お試しください。');
      }
    } catch (e) {
      alert('サーバーに接続できません。');
    }
    setLoading(false);
  };

  return (
    <div className="premium-overlay">
      <div className="premium-modal">
        <button className="premium-close" onClick={onClose}>✕</button>

        <div className="premium-header">
          <span className="premium-badge">⭐ プレミアム</span>
          <h2>CareerPathを<br/>フル活用しよう</h2>
          <div className="premium-price">
            <span className="premium-price-num">¥480</span>
            <span className="premium-price-unit">/ 月</span>
          </div>
        </div>

        <div className="premium-features">
          <div className="premium-feature">
            <span className="pf-icon">🤖</span>
            <div>
              <p className="pf-title">AI相談 無制限</p>
              <p className="pf-desc">何度でもキャリア相談できる（無料は月3回）</p>
            </div>
          </div>
          <div className="premium-feature">
            <span className="pf-icon">📋</span>
            <div>
              <p className="pf-title">AIが個人学習プランを自動生成</p>
              <p className="pf-desc">試験日・週の学習時間から最適スケジュールを作成</p>
            </div>
          </div>
          <div className="premium-feature">
            <span className="pf-icon">📊</span>
            <div>
              <p className="pf-title">AI週次レポート</p>
              <p className="pf-desc">毎週の学習を分析して改善アドバイスを配信</p>
            </div>
          </div>
          <div className="premium-feature">
            <span className="pf-icon">📈</span>
            <div>
              <p className="pf-title">詳細統計・分析</p>
              <p className="pf-desc">学習パターンの詳細分析とグラフ表示</p>
            </div>
          </div>
        </div>

        <button className="premium-btn" onClick={handleUpgrade} disabled={loading}>
          {loading ? '処理中...' : '今すぐアップグレード →'}
        </button>

        <p className="premium-note">いつでもキャンセル可能・14日間返金保証</p>

        <div className="premium-free">
          <p className="premium-free-title">🆓 無料プランのまま続ける</p>
          <ul>
            <li>✓ タイマー・カレンダー無制限</li>
            <li>✓ 資格ロードマップ無制限</li>
            <li>✓ AI相談 月3回まで</li>
          </ul>
          <button className="premium-skip" onClick={onClose}>無料プランで続ける</button>
        </div>
      </div>
    </div>
  );
}
