import { useEffect, useState } from 'react';
import { api } from '../api';
import PageTitle from './PageTitle';

function AdminPage({ user }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAdminStats()
      .then(setStats)
      .catch((apiError) => setError(apiError.message));
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <main className="page-wrap">
        <div className="empty-state">
          <strong>Admin login required</strong>
          <p>Login with the demo admin account to view this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <PageTitle
        eyebrow="Admin"
        title="Backend dashboard"
        copy="Live counts coming from MongoDB through Express APIs."
      />

      {error && <div className="form-error">{error}</div>}
      {stats ? (
        <div className="stats-strip admin-stats">
          <div><strong>{stats.users}</strong><span>Users</span></div>
          <div><strong>{stats.tools}</strong><span>Tools</span></div>
          <div><strong>{stats.availableTools}</strong><span>Available</span></div>
          <div><strong>{stats.requests}</strong><span>Requests</span></div>
          <div><strong>{stats.pendingRequests}</strong><span>Pending</span></div>
          <div><strong>{stats.reviews}</strong><span>Reviews</span></div>
        </div>
      ) : (
        <div className="empty-state"><strong>Loading admin data</strong></div>
      )}
    </main>
  );
}

export default AdminPage;
