import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

interface Props {
  onComplete: () => void;
}

export default function Auth({ onComplete }: Props) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('メールアドレスとパスワードを入力してください'); return; }
    if (password.length < 6) { setError('パスワードは6文字以上で設定してください'); return; }
    setLoading(true);
    setError('');

    const { error } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      setError(mode === 'login' ? 'メールアドレスまたはパスワードが違います' : 'アカウント作成に失敗しました');
    } else {
      if (mode === 'signup') {
        setDone(true);
      } else {
        onComplete();
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  if (done) {
    return (
      <div className="auth-screen">
        <div className="auth-done">
          <div className="auth-done-icon">📧</div>
          <h2>確認メールを送信しました</h2>
          <p>メールのリンクをクリックしてアカウントを確認してください</p>
          <button className="btn-primary" onClick={() => setMode('login')}>
            ログイン画面へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-header">
        <div className="auth-logo">
          <div className="auth-logo-icon">C</div>
          <span>CareerPath</span>
        </div>
        <h1>{mode === 'login' ? 'ログイン' : 'アカウント作成'}</h1>
        <p>{mode === 'login' ? '学習の続きを始めよう' : '無料で始めよう'}</p>
      </div>

      <div className="auth-body">
        {/* メール・パスワード */}
        <div className="auth-field">
          <label>メールアドレス</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div className="auth-field">
          <label>パスワード</label>
          <input
            type="password"
            placeholder="6文字以上"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウントを作成'}
        </button>

        <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? 'アカウントをお持ちでない方はこちら →' : 'すでにアカウントをお持ちの方はこちら →'}
        </button>
      </div>

      {/* プラン説明 */}
      <div className="auth-plans">
        <div className="auth-plan">
          <p className="auth-plan-name">🆓 無料プラン</p>
          <ul>
            <li>✓ タイマー・カレンダー無制限</li>
            <li>✓ 資格ロードマップ無制限</li>
            <li>✓ AI相談 月3回まで</li>
          </ul>
        </div>
        <div className="auth-plan auth-plan--premium">
          <p className="auth-plan-name">⭐ プレミアム <span>月額480円</span></p>
          <ul>
            <li>✓ AI相談 無制限</li>
            <li>✓ 詳細統計・分析</li>
            <li>✓ 優先サポート</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
