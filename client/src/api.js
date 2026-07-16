const API_URL = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API request failed');
  return data;
}

export const api = {
  login: (form) => request('/auth/login', { method: 'POST', body: JSON.stringify(form) }),
  register: (form) => request('/auth/register', { method: 'POST', body: JSON.stringify(form) }),
  getTools: () => request('/tools'),
  addTool: (tool) => request('/tools', { method: 'POST', body: JSON.stringify(tool) }),
  getRequests: () => request('/requests'),
  createRequest: (borrowRequest) =>
    request('/requests', { method: 'POST', body: JSON.stringify(borrowRequest) }),
  approveRequest: (id) => request(`/requests/${id}/approve`, { method: 'PATCH' }),
  rejectRequest: (id) => request(`/requests/${id}/reject`, { method: 'PATCH' }),
  returnRequest: (id) => request(`/requests/${id}/return`, { method: 'PATCH' }),
  getAdminStats: () => request('/admin/stats')
};
