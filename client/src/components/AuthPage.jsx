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
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">ToolPool account</p>
          <h1>{mode === 'login' ? 'Login to continue' : 'Create new account'}</h1>
          <p>Create a real account or sign in to your existing one.</p>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>Name
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
            </label>
          )}

          <label>Email
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
          </label>

          <label>Password
            <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} required />
          </label>

          {error && <div className="form-error">{error}</div>}
          <button className="submit-button" disabled={saving}>{saving ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
