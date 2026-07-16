import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import Header from './components/Header';
import AddToolModal from './components/AddToolModal';
import BorrowModal from './components/BorrowModal';
import BrowsePage from './components/BrowsePage';
import LenderPage from './components/LenderPage';
import MyRequestsPage from './components/MyRequestsPage';
import ProfilePage from './components/ProfilePage';
import AuthPage from './components/AuthPage';
import AdminPage from './components/AdminPage';
import { formatDate, loadLocal } from './helpers';

function cleanStatus(status) {
  return `${status || 'pending'}`.charAt(0).toUpperCase() + `${status || 'pending'}`.slice(1);
}

function makeTool(tool) {
  return {
    ...tool,
    id: tool._id || tool.id,
    area: tool.location || tool.area,
    rating: tool.rating || 4.8,
    distance: tool.distance || 'Nearby'
  };
}

function makeRequest(request) {
  const tool = request.toolId || {};
  const from = request.fromDate ? formatDate(request.fromDate) : '';
  const to = request.toDate ? formatDate(request.toDate) : '';

  return {
    ...request,
    id: request._id || request.id,
    toolId: tool._id || request.toolId,
    tool: tool.name || request.tool || 'Tool',
    dates: from && to ? `${from} - ${to}` : 'Date not selected',
    status: cleanStatus(request.status)
  };
}

function App() {
  const [view, setView] = useState('browse');
  const [user, setUser] = useState(() => loadLocal('toolpool-user', null));
  const [tools, setTools] = useState([]);
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const currentName = user?.name || 'Guest User';

  const myRequests = requests.filter((request) => request.borrower === currentName);
  const filteredTools = useMemo(() => {
    const term = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const searchText = `${tool.name} ${tool.category} ${tool.area}`.toLowerCase();
      const matchesText = !term || searchText.includes(term);
      const matchesCategory = category === 'All' || tool.category === category;
      const matchesAvailability = !availableOnly || tool.available;

      return matchesText && matchesCategory && matchesAvailability;
    });
  }, [tools, query, category, availableOnly]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [toolData, requestData] = await Promise.all([api.getTools(), api.getRequests()]);
      setTools(toolData.map(makeTool));
      setRequests(requestData.map(makeRequest));
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function saveUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem('toolpool-user', JSON.stringify(nextUser));
  }

  function showMessage(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  async function handleLogin(form) {
    const loggedInUser = await api.login(form);
    saveUser(loggedInUser);
    setView('browse');
    showMessage(`Welcome back, ${loggedInUser.name}`);
  }

  async function handleRegister(form) {
    const newUser = await api.register(form);
    saveUser(newUser);
    setView('browse');
    showMessage('Account created successfully');
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('toolpool-user');
    setView('login');
    showMessage('Logged out');
  }

  async function submitBorrow(tool, form) {
    if (!user) {
      setView('login');
      showMessage('Please login first');
      return;
    }

    try {
      await api.createRequest({
        toolId: tool.id,
        borrower: user.name,
        message: form.message,
        fromDate: form.from,
        toDate: form.to,
        deposit: tool.deposit
      });

      setSelectedTool(null);
      setView('requests');
      await loadDashboardData();
      showMessage('Request sent to the owner');
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function updateRequest(id, status) {
    try {
      if (status === 'Approved') await api.approveRequest(id);
      if (status === 'Declined') await api.rejectRequest(id);
      if (status === 'Returned') await api.returnRequest(id);

      await loadDashboardData();
      showMessage(status === 'Approved' ? 'Borrow request approved' : `Request marked ${status.toLowerCase()}`);
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function addTool(tool) {
    if (!user) {
      setView('login');
      showMessage('Please login first');
      return;
    }

    try {
      await api.addTool({
        name: tool.name,
        category: tool.category,
        owner: user.name,
        location: tool.area,
        distance: 'Your listing',
        deposit: tool.deposit,
        description: tool.description,
        image: tool.image
      });

      setShowAddTool(false);
      setView('lender');
      await loadDashboardData();
      showMessage('Tool added to your workshop');
    } catch (error) {
      showMessage(error.message);
    }
  }

  return (
    <div className="app-shell">
      <Header
        view={view}
        user={user}
        onNavigate={setView}
        onAdd={() => setShowAddTool(true)}
        onLogout={handleLogout}
      />

      {view === 'login' && <AuthPage onLogin={handleLogin} onRegister={handleRegister} />}
      {view === 'browse' && (
        <BrowsePage
          tools={filteredTools}
          totalTools={tools.length}
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          availableOnly={availableOnly}
          onAvailabilityChange={setAvailableOnly}
          onBorrow={setSelectedTool}
          loading={loading}
        />
      )}
      {view === 'requests' && <MyRequestsPage requests={myRequests} onBrowse={() => setView('browse')} />}
      {view === 'lender' && (
        <LenderPage
          user={user}
          tools={tools}
          requests={requests}
          onUpdate={updateRequest}
          onAdd={() => setShowAddTool(true)}
        />
      )}
      {view === 'profile' && <ProfilePage user={user} requests={myRequests} tools={tools} />}
      {view === 'admin' && <AdminPage user={user} />}

      {selectedTool && (
        <BorrowModal tool={selectedTool} onClose={() => setSelectedTool(null)} onSubmit={submitBorrow} />
      )}
      {showAddTool && <AddToolModal onClose={() => setShowAddTool(false)} onSubmit={addTool} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default App;
