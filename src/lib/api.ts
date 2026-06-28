// Vercel上では相対パス、ローカルではlocalhost:3001を使う
const isLocal = window.location.hostname === 'localhost';
export const API_BASE = isLocal ? 'http://localhost:3001' : '';

export const CHAT_API = `${API_BASE}/api/chat`;
export const CHECKOUT_API = `${API_BASE}/api/create-checkout`;
