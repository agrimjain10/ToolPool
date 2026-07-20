import { useState } from 'react';

function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (mode === 'login') {
        await onLogin({ email: form.email, password: form.password });
      } else {
        await onRegister(form);
      }
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-page-split">
      {/* Left Info Panel */}
      <section className="auth-info-panel">
        <div className="auth-info-content">
          <div className="brand-logo">
            <span className="logo-mark">T</span>
            <h3>ToolPool</h3>
          </div>
          <h1>Join your local sharing network</h1>
          <p>Don't spend money on items you'll only use once. Connect with verified neighbors to borrow and lend tools safely.</p>
          
          <ul className="feature-bullets">
            <li>
              <span className="bullet-icon">🔒</span>
              <div>
                <strong>Secure Sharing</strong>
                <p>Fully refundable security deposits and verified user accounts.</p>
              </div>
            </li>
            <li>
              <span className="bullet-icon">📍</span>
              <div>
                <strong>Local Community</strong>
                <p>Find tools within your campus or neighborhood. Quick meetups.</p>
              </div>
            </li>
            <li>
              <span className="bullet-icon">💬</span>
              <div>
                <strong>In-app Chat</strong>
                <p>Chat directly with tool owners to coordinate pick-up and drop-off.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{mode === 'login' ? 'Login to access your neighborhood toolpool.' : 'Register to start borrowing and lending.'}</p>
          </div>

          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="input-group">
                <label htmlFor="auth-name">Full Name</label>
                <input id="auth-name" type="text" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Rohan Sharma" required />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="auth-email">Email Address</label>
              <input id="auth-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="e.g. rohan@gmail.com" required />
            </div>

            <div className="input-group">
              <label htmlFor="auth-password">Password</label>
              <input id="auth-password" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="••••••••" required />
            </div>

            {error && <div className="form-error">{error}</div>}
            
            <button className="submit-button" disabled={saving}>
              {saving ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register Now'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
