import { useMemo, useState } from 'react';

const starterTools = [
  {
    id: 1,
    name: 'Bosch Impact Drill',
    category: 'Power tools',
    owner: 'Rohan Mehta',
    area: 'Vijay Nagar',
    distance: '350 m away',
    deposit: 500,
    rating: 4.9,
    available: true,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85',
    description: 'Compact 18V drill with charger and a basic bit set. Works well for shelves and small repairs.'
  },
  {
    id: 2,
    name: '6 ft Step Ladder',
    category: 'Home repair',
    owner: 'Ananya Shah',
    area: 'Scheme 54',
    distance: '700 m away',
    deposit: 300,
    rating: 4.8,
    available: true,
    image: 'https://images.unsplash.com/photo-1591588582259-e675bd2e6088?auto=format&fit=crop&w=900&q=85',
    description: 'Sturdy aluminium ladder with a wide top step. Easy to carry and folds flat for transport.'
  },
  {
    id: 3,
    name: 'Garden Tool Set',
    category: 'Gardening',
    owner: 'Neha Verma',
    area: 'Palasia',
    distance: '1.1 km away',
    deposit: 250,
    rating: 4.7,
    available: true,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=85',
    description: 'Hand trowel, cultivator, pruner and gloves. Cleaned after every use and packed together.'
  },
  {
    id: 4,
    name: 'Karcher Pressure Washer',
    category: 'Cleaning',
    owner: 'Kabir Arora',
    area: 'New Palasia',
    distance: '1.4 km away',
    deposit: 900,
    rating: 5.0,
    available: false,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=85',
    description: 'Portable washer with a 5 metre hose. Great for balconies, cars and outdoor furniture.'
  },
  {
    id: 5,
    name: 'Black + Decker Jigsaw',
    category: 'Power tools',
    owner: 'Aman Jain',
    area: 'Saket Nagar',
    distance: '1.8 km away',
    deposit: 600,
    rating: 4.6,
    available: true,
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=900&q=85',
    description: 'Variable-speed jigsaw with wood blades. Best for plywood, MDF and simple curved cuts.'
  },
  {
    id: 6,
    name: 'Camping Tent for 4',
    category: 'Outdoor',
    owner: 'Meera Joshi',
    area: 'Bengali Square',
    distance: '2.2 km away',
    deposit: 750,
    rating: 4.9,
    available: true,
    image: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=900&q=85',
    description: 'Water-resistant four-person tent with ground sheet, poles and carry bag included.'
  }
];

const starterRequests = [
  { id: 101, toolId: 3, tool: 'Garden Tool Set', borrower: 'Ishita Rao', dates: '18 - 20 Jul', message: 'Setting up a small balcony garden this weekend.', status: 'Pending' },
  { id: 102, toolId: 1, tool: 'Bosch Impact Drill', borrower: 'Dev Malhotra', dates: '19 Jul', message: 'Need to install two curtain rods at home.', status: 'Approved' }
];

const categories = ['All', 'Power tools', 'Home repair', 'Gardening', 'Cleaning', 'Outdoor'];

function loadLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [view, setView] = useState('browse');
  const [tools, setTools] = useState(() => loadLocal('toolpool-tools', starterTools));
  const [requests, setRequests] = useState(() => loadLocal('toolpool-requests', starterRequests));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [toast, setToast] = useState('');

  const myRequests = requests.filter((request) => request.borrower === 'Agrim Jain');
  const filteredTools = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesText = !term || `${tool.name} ${tool.category} ${tool.area}`.toLowerCase().includes(term);
      const matchesCategory = category === 'All' || tool.category === category;
      return matchesText && matchesCategory && (!availableOnly || tool.available);
    });
  }, [tools, query, category, availableOnly]);

  function persistTools(nextTools) {
    setTools(nextTools);
    localStorage.setItem('toolpool-tools', JSON.stringify(nextTools));
  }

  function persistRequests(nextRequests) {
    setRequests(nextRequests);
    localStorage.setItem('toolpool-requests', JSON.stringify(nextRequests));
  }

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function submitBorrow(tool, form) {
    const nextRequest = {
      id: Date.now(),
      toolId: tool.id,
      tool: tool.name,
      borrower: 'Agrim Jain',
      dates: `${formatDate(form.from)} - ${formatDate(form.to)}`,
      message: form.message,
      status: 'Pending'
    };
    persistRequests([nextRequest, ...requests]);
    setSelectedTool(null);
    setView('requests');
    notify('Request sent to the owner');
  }

  function updateRequest(id, status) {
    persistRequests(requests.map((request) => request.id === id ? { ...request, status } : request));
    notify(status === 'Approved' ? 'Borrow request approved' : `Request marked ${status.toLowerCase()}`);
  }

  function addTool(tool) {
    persistTools([{ ...tool, id: Date.now(), owner: 'Agrim Jain', rating: 5, available: true }, ...tools]);
    setShowAddTool(false);
    setView('lender');
    notify('Tool added to your workshop');
  }

  return (
    <div className="app-shell">
      <Header view={view} setView={setView} onAdd={() => setShowAddTool(true)} />

      {view === 'browse' && (
        <Browse
          tools={filteredTools}
          totalTools={tools.length}
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          availableOnly={availableOnly}
          setAvailableOnly={setAvailableOnly}
          onBorrow={setSelectedTool}
        />
      )}
      {view === 'requests' && <MyRequests requests={myRequests} onBrowse={() => setView('browse')} />}
      {view === 'lender' && <Lender tools={tools} requests={requests} onUpdate={updateRequest} onAdd={() => setShowAddTool(true)} />}
      {view === 'profile' && <Profile requests={myRequests} tools={tools} />}

      {selectedTool && <BorrowModal tool={selectedTool} onClose={() => setSelectedTool(null)} onSubmit={submitBorrow} />}
      {showAddTool && <AddToolModal onClose={() => setShowAddTool(false)} onSubmit={addTool} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Header({ view, setView, onAdd }) {
  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => setView('browse')} aria-label="ToolPool home">
        <span className="brand-mark">T</span>
        <span><strong>ToolPool</strong><small>Vijay Nagar community</small></span>
      </button>
      <nav className="main-nav" aria-label="Main navigation">
        <button className={view === 'browse' ? 'active' : ''} onClick={() => setView('browse')}>Find tools</button>
        <button className={view === 'requests' ? 'active' : ''} onClick={() => setView('requests')}>My requests</button>
        <button className={view === 'lender' ? 'active' : ''} onClick={() => setView('lender')}>My workshop</button>
      </nav>
      <div className="account-actions">
        <button className="add-button" onClick={onAdd}><span aria-hidden="true">+</span> List a tool</button>
        <button className="avatar" onClick={() => setView('profile')} aria-label="Open profile">AJ</button>
      </div>
    </header>
  );
}

function Browse({ tools, totalTools, query, setQuery, category, setCategory, availableOnly, setAvailableOnly, onBorrow }) {
  return (
    <main>
      <section className="intro-band">
        <div className="intro-copy">
          <p className="eyebrow">Your neighbourhood workshop</p>
          <h1>Why buy it when a neighbour has it?</h1>
          <p>Borrow useful things nearby, meet good people, and make a little more room at home.</p>
        </div>
        <div className="community-note">
          <strong>{totalTools + 42} tools</strong>
          <span>shared by 28 neighbours near you</span>
        </div>
      </section>

      <section className="browse-section">
        <div className="search-row">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by tool, category or area" />
          </label>
          <label className="availability-toggle">
            <input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} />
            <span>Available now</span>
          </label>
        </div>
        <div className="category-list" aria-label="Tool categories">
          {categories.map((item) => (
            <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>

        <div className="section-heading">
          <div><h2>Tools near you</h2><p>{tools.length} matches within your neighbourhood</p></div>
          <select aria-label="Sort tools" defaultValue="nearest"><option value="nearest">Nearest first</option><option value="rating">Top rated</option><option value="deposit">Lowest deposit</option></select>
        </div>

        {tools.length > 0 ? (
          <div className="tool-grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} onBorrow={onBorrow} />)}</div>
        ) : (
          <div className="empty-state"><strong>No tools found</strong><p>Try a different category or search term.</p></div>
        )}
      </section>
    </main>
  );
}

function ToolCard({ tool, onBorrow }) {
  return (
    <article className="tool-card">
      <div className="tool-image-wrap">
        <img src={tool.image} alt={tool.name} />
        <span className={`availability ${tool.available ? '' : 'busy'}`}>{tool.available ? 'Available' : 'Borrowed'}</span>
      </div>
      <div className="tool-content">
        <div className="tool-category">{tool.category}</div>
        <h3>{tool.name}</h3>
        <p className="tool-description">{tool.description}</p>
        <div className="owner-line">
          <span className="owner-avatar">{initials(tool.owner)}</span>
          <span><strong>{tool.owner}</strong><small>★ {tool.rating} · {tool.distance}</small></span>
        </div>
        <div className="tool-footer">
          <span><strong>₹{tool.deposit}</strong><small> refundable deposit</small></span>
          <button disabled={!tool.available} onClick={() => onBorrow(tool)}>{tool.available ? 'Request tool' : 'Unavailable'}</button>
        </div>
      </div>
    </article>
  );
}

function MyRequests({ requests, onBrowse }) {
  return (
    <main className="page-wrap">
      <PageTitle eyebrow="Borrowing" title="My requests" copy="Everything you have requested from neighbours, in one place." />
      {requests.length ? (
        <div className="request-list">
          {requests.map((request) => (
            <article className="request-row" key={request.id}>
              <div className="request-icon">{request.tool.slice(0, 1)}</div>
              <div className="request-main"><strong>{request.tool}</strong><span>{request.dates}</span><p>{request.message}</p></div>
              <Status status={request.status} />
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><strong>No requests yet</strong><p>Your borrowing requests will appear here.</p><button onClick={onBrowse}>Browse tools</button></div>
      )}
    </main>
  );
}

function Lender({ tools, requests, onUpdate, onAdd }) {
  const lenderRequests = requests.filter((request) => request.borrower !== 'Agrim Jain');
  const ownTools = tools.filter((tool) => tool.owner === 'Agrim Jain');
  return (
    <main className="page-wrap">
      <div className="title-actions"><PageTitle eyebrow="Lender dashboard" title="My workshop" copy="Manage your tools and respond to neighbours." /><button className="primary-action" onClick={onAdd}>+ Add a tool</button></div>
      <div className="stats-strip">
        <div><strong>{ownTools.length || 3}</strong><span>Listed tools</span></div>
        <div><strong>{lenderRequests.filter((item) => item.status === 'Pending').length}</strong><span>New requests</span></div>
        <div><strong>12</strong><span>Successful shares</span></div>
        <div><strong>4.9</strong><span>Neighbour rating</span></div>
      </div>
      <section className="dashboard-section">
        <div className="section-heading"><div><h2>Borrow requests</h2><p>Review dates and messages before approving.</p></div></div>
        <div className="request-list">
          {lenderRequests.map((request) => (
            <article className="request-row lender-row" key={request.id}>
              <div className="request-icon">{initials(request.borrower)}</div>
              <div className="request-main"><strong>{request.borrower} wants your {request.tool}</strong><span>{request.dates}</span><p>“{request.message}”</p></div>
              <div className="lender-actions">
                <Status status={request.status} />
                {request.status === 'Pending' && <><button className="quiet-button" onClick={() => onUpdate(request.id, 'Declined')}>Decline</button><button onClick={() => onUpdate(request.id, 'Approved')}>Approve</button></>}
                {request.status === 'Approved' && <button onClick={() => onUpdate(request.id, 'Returned')}>Mark returned</button>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Profile({ requests, tools }) {
  return (
    <main className="page-wrap profile-page">
      <section className="profile-head"><div className="profile-avatar">AJ</div><div><p className="eyebrow">Community member</p><h1>Agrim Jain</h1><p>Vijay Nagar, Indore · Member since March 2026</p></div></section>
      <div className="profile-grid">
        <section><h2>Community record</h2><div className="profile-facts"><div><strong>4.9</strong><span>Rating</span></div><div><strong>{requests.length + 8}</strong><span>Borrows</span></div><div><strong>{tools.filter((tool) => tool.owner === 'Agrim Jain').length + 3}</strong><span>Tools shared</span></div></div></section>
        <section><h2>About</h2><p>Weekend DIY enthusiast. Usually available for handovers after 6 PM and happy to help with basic setup.</p><div className="verified-row"><span>✓ Phone verified</span><span>✓ Address verified</span></div></section>
      </div>
    </main>
  );
}

function BorrowModal({ tool, onClose, onSubmit }) {
  const [form, setForm] = useState({ from: '2026-07-18', to: '2026-07-20', message: 'Hi! I need this for a small home project. I can pick it up in the evening.' });
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={(event) => { event.preventDefault(); onSubmit(tool, form); }}>
        <div className="modal-head"><div><p className="eyebrow">Borrow request</p><h2>{tool.name}</h2></div><button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button></div>
        <div className="date-grid"><label>From<input type="date" value={form.from} onChange={(event) => setForm({ ...form, from: event.target.value })} required /></label><label>To<input type="date" min={form.from} value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })} required /></label></div>
        <label>Message to {tool.owner.split(' ')[0]}<textarea rows="4" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required /></label>
        <div className="deposit-line"><span>Refundable deposit</span><strong>₹{tool.deposit}</strong></div>
        <button className="submit-button" type="submit">Send request</button>
      </form>
    </div>
  );
}

function AddToolModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', category: 'Power tools', area: 'Vijay Nagar', deposit: 400, description: '', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85' });
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, deposit: Number(form.deposit), distance: 'Your listing' }); }}>
        <div className="modal-head"><div><p className="eyebrow">Your workshop</p><h2>List a tool</h2></div><button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button></div>
        <label>Tool name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Cordless drill" required /></label>
        <div className="date-grid"><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Deposit (₹)<input type="number" min="0" value={form.deposit} onChange={(event) => setForm({ ...form, deposit: event.target.value })} required /></label></div>
        <label>Short description<textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Condition, included parts, and suitable uses" required /></label>
        <button className="submit-button" type="submit">Publish tool</button>
      </form>
    </div>
  );
}

function PageTitle({ eyebrow, title, copy }) {
  return <div className="page-title"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div>;
}

function Status({ status }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

function initials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('');
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`));
}

export default App;
