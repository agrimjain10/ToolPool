function Header({ view, onNavigate, onAdd }) {
  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => onNavigate('browse')} aria-label="ToolPool home">
        <span className="brand-mark">T</span>
        <span><strong>ToolPool</strong><small>Vijay Nagar community</small></span>
      </button>

      <nav className="main-nav" aria-label="Main navigation">
        <button className={view === 'browse' ? 'active' : ''} onClick={() => onNavigate('browse')}>Find tools</button>
        <button className={view === 'requests' ? 'active' : ''} onClick={() => onNavigate('requests')}>My requests</button>
        <button className={view === 'lender' ? 'active' : ''} onClick={() => onNavigate('lender')}>My workshop</button>
      </nav>

      <div className="account-actions">
        <button className="add-button" onClick={onAdd}><span aria-hidden="true">+</span> List a tool</button>
        <button className="avatar" onClick={() => onNavigate('profile')} aria-label="Open profile">AJ</button>
      </div>
    </header>
  );
}

export default Header;
