import { CHAT_API } from '../lib/api';
import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { QUALIFICATIONS, CAREERS } from '../data/masterData';
import './Consult.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onShowPremium: () => void;
}

const SYSTEM_PROMPT = `あなたは「CareerPath」というアプリの専属キャリアコンサルタントです。
ユーザー（主に就活生・若手社会人・大学生）の「なりたい自分」を一緒に見つけ、最適な資格取得プランを提案します。

【あなたのキャラクター】
- 渋谷の大学生が作ったアプリのコンサルタントとして、フレンドリーで親しみやすい口調
- 「ですます調」で話すが、堅すぎない。絵文字も適度に使う
- ユーザーの悩みに共感しながら、具体的なアドバイスをする

【対話の流れ】
1. まずユーザーの現状（学年・職業・悩み）を聞く
2. 好きなこと・得意なこと・やりたいことを引き出す
3. 将来のビジョン・理想の働き方を具体化する
4. 最適なキャリアパスを2〜3個提案する
5. 各キャリアに必要な資格を具体的に提示する
6. 学習プランのアドバイスをする

【提案できる資格の例】
TOEIC、英検、簿記、FP、ITパスポート、基本情報技術者、AWS、宅建、社労士、行政書士、
中小企業診断士、キャリアコンサルタント、看護師、介護福祉士、調理師、美容師、
カラーコーディネーター、Webデザイン技能検定、マーケティング検定、証券外務員など

【重要なルール】
- 一度に長くなりすぎず、会話をキャッチボールするように進める
- ユーザーが答えやすいように、具体的な選択肢を提示する
- 最終的に必ず「この資格から始めよう！」という具体的な第一歩を提示する
- 日本語で話す`;

export default function Consult({ onShowPremium }: Props) {
  const { addGoal, setWeeklyTarget } = useAppState();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'こんにちは！CareerPathのキャリアコンサルタントです🎯\n\nあなたの「なりたい自分」を一緒に見つけて、最適な資格取得プランを作りましょう！\n\nまず教えてください。今どんな状況ですか？',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickReplies = [
    '大学生で就活を控えています',
    '社会人でキャリアアップしたい',
    'やりたいことが見つからない',
    '転職を考えています',
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowQuickReplies(false);

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(CHAT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'すみません、もう一度お試しください。';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'ネットワークエラーが発生しました。もう一度お試しください。',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: 'こんにちは！CareerPathのキャリアコンサルタントです🎯\n\nあなたの「なりたい自分」を一緒に見つけて、最適な資格取得プランを作りましょう！\n\nまず教えてください。今どんな状況ですか？',
    }]);
    setShowQuickReplies(true);
    setInput('');
  };

  return (
    <div className="page consult-page">
      <div className="page-header">
        <div className="consult-header-row">
          <div>
            <h1>AIキャリア相談</h1>
            <p className="consult-header-sub">あなたの「なりたい自分」を一緒に見つけます</p>
          </div>
          <button className="consult-reset" onClick={handleReset}>最初から</button>
        </div>
      </div>

      {/* チャットエリア */}
      <div className="consult-chat">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble-wrap ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="chat-avatar">AI</div>
            )}
            <div className={`chat-bubble ${msg.role}`}>
              {msg.content.split('\n').map((line, j) => (
                <React.Fragment key={j}>
                  {line}
                  {j < msg.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}

        {/* クイック返信 */}
        {showQuickReplies && (
          <div className="quick-replies">
            {quickReplies.map((reply, i) => (
              <button key={i} className="quick-reply-btn" onClick={() => sendMessage(reply)}>
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* ローディング */}
        {loading && (
          <div className="chat-bubble-wrap assistant">
            <div className="chat-avatar">AI</div>
            <div className="chat-bubble assistant loading-bubble">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div className="consult-input-area">
        <div className="consult-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="consult-input"
            placeholder="メッセージを入力..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            disabled={loading}
          />
          <button
            className="consult-send"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            送信
          </button>
        </div>
        <p className="consult-note">AIが資格・キャリアをパーソナライズ提案します</p>
      </div>
    </div>
  );
}
