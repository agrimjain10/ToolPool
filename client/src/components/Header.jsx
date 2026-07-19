function Header({ view, user, onNavigate, onAdd, onLogout }) {
  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')
    : 'AJ';

  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => onNavigate(user ? 'browse' : 'landing')} aria-label="CampusShare home">
        <span className="brand-mark">C</span>
        <span><strong>CampusShare</strong><small>Campus Community</small></span>
      </button>

      {user && user.role === 'admin' && (
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'browse' ? 'active' : ''} onClick={() => onNavigate('browse')}>Find items</button>
          <button className={view === 'requests' ? 'active' : ''} onClick={() => onNavigate('requests')}>My requests</button>
          <button className={view === 'lender' ? 'active' : ''} onClick={() => onNavigate('lender')}>My inventory</button>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => onNavigate('admin')}>Admin</button>
        </nav>
      )}

      {user && user.role !== 'admin' && (
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'browse' ? 'active' : ''} onClick={() => onNavigate('browse')}>Find items</button>
          <button className={view === 'requests' ? 'active' : ''} onClick={() => onNavigate('requests')}>My requests</button>
          <button className={view === 'lender' ? 'active' : ''} onClick={() => onNavigate('lender')}>My inventory</button>
        </nav>
      )}

      <div className="account-actions">
        {user ? (
          <>
            <button className="add-button" onClick={onAdd}><span aria-hidden="true">+</span> List an item</button>
            <span className="account-role">{user.role === 'admin' ? 'Admin' : 'Student'}</span>
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
