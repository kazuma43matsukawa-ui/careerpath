// 環境に応じてAPIのベースURLを切り替え
export const API_BASE = process.env.NODE_ENV === 'production'
  ? ''  // Vercelでは同じドメインの/api/...を使う
  : 'http://localhost:3001';

export const CHAT_API = `${API_BASE}/api/chat`;
export const CHECKOUT_API = `${API_BASE}/api/create-checkout`;
