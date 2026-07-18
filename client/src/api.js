const API_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthToken() {
  try {
    const stored = localStorage.getItem('toolpool-auth');
    if (!stored) return '';
    return JSON.parse(stored)?.token || '';
  } catch {
    return '';
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API request failed');
  return data;
}

export const api = {
  login: (form) => request('/auth/login', { method: 'POST', body: JSON.stringify(form) }),
  register: (form) => request('/auth/register', { method: 'POST', body: JSON.stringify(form) }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getTools: ({ mine = false } = {}) => request(`/tools${mine ? '?mine=true' : ''}`),
  getCategories: () => request('/tools/categories'),
  addTool: (tool) => request('/tools', { method: 'POST', body: JSON.stringify(tool) }),
  getRequests: () => request('/requests'),
  createRequest: (borrowRequest) =>
    request('/requests', { method: 'POST', body: JSON.stringify(borrowRequest) }),
  approveRequest: (id) => request(`/requests/${id}/approve`, { method: 'PATCH' }),
  rejectRequest: (id) => request(`/requests/${id}/reject`, { method: 'PATCH' }),
  returnRequest: (id) => request(`/requests/${id}/return`, { method: 'PATCH' }),
  getChatMessages: (requestId) => request(`/messages/request/${requestId}`),
  sendChatMessage: (message) => request('/messages', { method: 'POST', body: JSON.stringify(message) }),
  getAdminStats: () => request('/admin/stats'),
  chatStreamUrl: (requestId) => {
    const token = getAuthToken();
    return `${API_URL}/messages/request/${requestId}/stream?token=${encodeURIComponent(token)}`;
  }
};
