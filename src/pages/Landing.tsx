import React from 'react';
import './Landing.css';

interface Props {
  onStart: () => void;
}

export default function Landing({ onStart }: Props) {
  return (
    <div className="landing">
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-icon">C</div>
          <span className="lp-logo-text">CareerPath <span className="lp-logo-sub">（仮）</span></span>
        </div>
        <button className="lp-nav-btn" onClick={onStart}>無料DL</button>
      </nav>

      <div className="lp-hero">
        <div className="lp-badge">合格への逆算ロードマップ × 学習管理</div>
        <h1>資格取得まで、<br/>あと<span className="lp-accent">何時間</span>？</h1>
        <p>TOEIC、FP、簿記…人気資格の<strong>合格目安時間を完全可視化。</strong><br/>週単位のコミットメントで、もう三日坊主で終わらせない。</p>
        <button className="lp-btn-primary" onClick={onStart}>無料でダウンロード</button>
        <div className="lp-appstore">
          <span>🍎</span>
          <div><div className="lp-as-sub">Download on the</div><div className="lp-as-main">App Store</div></div>
        </div>
      </div>

      <div className="lp-pain">
        <p className="lp-section-label">こんなお悩み、ありませんか？</p>
        <h2>記録するだけじゃ、<br/>続かない。</h2>
        {[
          '簿記3級のテキストは買ったけど、いつまでに何時間やればいいか分からない…',
          '毎日記録をつけるだけの勉強アプリだと、途中で飽きてしまう…',
          'せっかく勉強するなら、将来のキャリアに活きるか知りたい！',
        ].map((text, i) => (
          <div key={i} className="lp-pain-item">
            <span className="lp-pain-x">✕</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <div className="lp-goal">
        <p className="lp-section-label">YOUR GOAL</p>
        <h2>資格取得は、<br/><mark>ゴールじゃない。</mark></h2>
        <p className="lp-goal-desc">大切なのは、その先。資格はあくまで「理想のキャリア」への通過点です。</p>
        {[
          { qual: 'TOEIC 800 / 簿記2級', career: 'グローバルに活躍する商社職' },
          { qual: 'ITパスポート / 基本情報', career: 'DXを推進するITコンサルタント' },
          { qual: 'FP3級・2級', career: '信頼される金融プランナー' },
        ].map((item, i) => (
          <div key={i} className="lp-career-card">
            <div className="lp-cc-left"><span className="lp-cc-tag">通過点</span><strong>{item.qual}</strong></div>
            <span className="lp-cc-arrow">↗</span>
            <div className="lp-cc-right"><span className="lp-cc-tag green">めざすキャリア</span><strong>{item.career}</strong></div>
          </div>
        ))}
        <p className="lp-goal-note">CareerPath は、合格の先にある<br/><strong>「なりたい自分」から逆算</strong>します。</p>
      </div>

      <div className="lp-features">
        <h2>ゴールが見えるから、<br/>迷わず続けられる。</h2>
        {[
          { num: 1, title: '王道資格の「逆算ロードマップ」', desc: '人気資格の合格目安時間を最初から提示。ゴールが見えるから迷わない。' },
          { num: 2, title: '週単位の「コミットメント宣言」', desc: '「今週は10時間やる」と宣言し、進捗バーでリアルタイム管理。適度なプレッシャーがやる気を維持。' },
          { num: 3, title: '学習の軌跡と「振り返りカレンダー」', desc: '勉強した日がカレンダーで色づく。継続の可視化がモチベーションに。' },
        ].map(f => (
          <div key={f.num} className="lp-feat-card">
            <div className="lp-feat-num">{f.num}</div>
            <div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="lp-cta">
        <h2>あなたの時間は、<br/>未来への<span className="lp-accent">投資</span>。</h2>
        <p>今すぐ目標を設定して、<br/>最初の1時間をスタートしよう。</p>
        <button className="lp-btn-primary" onClick={onStart}>無料でダウンロード</button>
      </div>
    </div>
  );
}
