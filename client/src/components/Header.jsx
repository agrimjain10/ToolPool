function Header({ view, user, onNavigate, onAdd, onLogout }) {
  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')
    : 'AJ';

  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => onNavigate(user ? 'browse' : 'landing')} aria-label="ToolPool home">
        <span className="brand-mark">T</span>
        <span><strong>ToolPool</strong><small>Vijay Nagar community</small></span>
      </button>

      {user && user.role === 'admin' && (
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'browse' ? 'active' : ''} onClick={() => onNavigate('browse')}>Find tools</button>
          <button className={view === 'requests' ? 'active' : ''} onClick={() => onNavigate('requests')}>My requests</button>
          <button className={view === 'lender' ? 'active' : ''} onClick={() => onNavigate('lender')}>My workshop</button>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => onNavigate('admin')}>Admin</button>
        </nav>
      )}

      {user && user.role !== 'admin' && (
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'browse' ? 'active' : ''} onClick={() => onNavigate('browse')}>Find tools</button>
          <button className={view === 'requests' ? 'active' : ''} onClick={() => onNavigate('requests')}>My requests</button>
          <button className={view === 'lender' ? 'active' : ''} onClick={() => onNavigate('lender')}>My workshop</button>
        </nav>
      )}

      <div className="account-actions">
        {user ? (
          <>
            <button className="add-button" onClick={onAdd}><span aria-hidden="true">+</span> List a tool</button>
            <span className="account-role">{user.role === 'admin' ? 'Admin' : 'Customer'}</span>
            <button className="avatar" onClick={() => onNavigate('profile')} aria-label="Open profile">{initials}</button>
            <button className="text-action" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button className="text-action" onClick={() => onNavigate('login')}>Login</button>
        )}
      </div>
    </header>
  );
}

export default Header;
