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
import LandingPage from './components/LandingPage';
import ChatModal from './components/ChatModal';
import { formatDate, loadLocal } from './helpers';
import { categories as fallbackCategories } from './data';

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
    toolOwner: tool.owner || request.toolOwner || '',
    dates: from && to ? `${from} - ${to}` : 'Date not selected',
    status: cleanStatus(request.status)
  };
}

function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [tools, setTools] = useState([]);
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [chatRequest, setChatRequest] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [likedOnly, setLikedOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    hydrateAuth();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (authReady && user) {
        loadDashboardData();
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [authReady, user]);

  const currentName = user?.name || 'Guest User';
  const canSeeAdmin = user?.role === 'admin';
  const ownsTool = (tool) => (tool.ownerId && user?.id && String(tool.ownerId) === String(user.id)) || tool.owner === currentName;
  const myTools = tools.filter(ownsTool);
  const nearbyTools = tools.filter((tool) => !ownsTool(tool));

  const myRequests = requests.filter((request) => request.borrower === currentName);
  const filteredTools = useMemo(() => {
    const term = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const searchText = `${tool.name} ${tool.category} ${tool.area}`.toLowerCase();
      const matchesText = !term || searchText.includes(term);
      const matchesCategory = category === 'All' || tool.category === category;
      const matchesAvailability = !availableOnly || tool.available;
      const matchesLiked = !likedOnly || favorites.includes(tool.id);

      return matchesText && matchesCategory && matchesAvailability && matchesLiked;
    });
  }, [tools, query, category, availableOnly, likedOnly, favorites]);

  async function loadDashboardData(activeUser = user) {
    try {
      setLoading(true);
      const [marketplaceTools, ownedTools, requestData, categoryData, favoriteData] = await Promise.all([
        api.getTools(),
        activeUser && activeUser.role !== 'admin' ? api.getTools({ mine: true }) : Promise.resolve([]),
        api.getRequests(),
        api.getCategories(),
        activeUser ? api.getFavorites(activeUser.name) : Promise.resolve([])
      ]);
      const uniqueTools = [...new Map([...marketplaceTools, ...ownedTools].map((tool) => [tool._id || tool.id, tool])).values()];
      setTools(uniqueTools.map(makeTool));
      setRequests(requestData.map(makeRequest));
      setCategories(categoryData.length ? ['All', ...categoryData] : fallbackCategories);
      setFavorites(favoriteData.map((fav) => fav.toolId?._id || fav.toolId?.id || fav.toolId).filter(Boolean));
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(toolId) {
    if (!user) {
      setView('login');
      showMessage('Please login to save favorites');
      return;
    }
    const currentUser = user;
    const isFav = favorites.includes(toolId);
    try {
      if (isFav) {
        await api.deleteFavorite(currentUser.name, toolId);
        setFavorites((current) => current.filter((id) => id !== toolId));
        showMessage('Removed from favorites');
      } else {
        await api.addFavorite({ userName: currentUser.name, toolId });
        setFavorites((current) => [...current, toolId]);
        showMessage('Added to favorites');
      }
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function hydrateAuth() {
    try {
      const stored = loadLocal('toolpool-auth', null);
      if (!stored?.token) {
        setView('landing');
        setAuthReady(true);
        return;
      }

      const currentUser = await api.me();
      setUser(currentUser);
      localStorage.setItem('toolpool-auth', JSON.stringify({ token: stored.token, user: currentUser }));
      await loadDashboardData(currentUser);
      setView('browse');
    } catch {
      localStorage.removeItem('toolpool-auth');
      setUser(null);
      setView('landing');
    } finally {
      setAuthReady(true);
    }
  }

  function saveAuth(auth) {
    setUser(auth.user);
    localStorage.setItem('toolpool-auth', JSON.stringify(auth));
  }

  function showMessage(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  async function handleLogin(form) {
    const auth = await api.login(form);
    saveAuth(auth);
    await loadDashboardData(auth.user);
    setView('browse');
    showMessage(`Welcome back, ${auth.user.name}`);
  }

  async function handleRegister(form) {
    const auth = await api.register(form);
    saveAuth(auth);
    await loadDashboardData(auth.user);
    setView('browse');
    showMessage('Account created successfully');
  }

  async function handleLogout() {
    try {
      await api.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('toolpool-auth');
      setView('landing');
      showMessage('Logged out');
    }
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
        location: tool.area,
        distance: 'Your listing',
        deposit: tool.deposit,
        description: tool.description,
        condition: tool.condition,
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

  async function openChat(request) {
    setChatRequest(request);
  }

  function closeChat() {
    setChatRequest(null);
  }

  return (
    <div className="app-shell">
      <Header
        view={view}
        user={user}
        onNavigate={(nextView) => setView(user?.role === 'admin' || nextView !== 'admin' ? nextView : 'browse')}
        onAdd={() => setShowAddTool(true)}
        onLogout={handleLogout}
      />

      {!authReady && <main className="page-wrap"><div className="empty-state"><strong>Loading account</strong></div></main>}
      {authReady && !user && view === 'landing' && <LandingPage onLogin={() => setView('login')} />}
      {authReady && view === 'login' && <AuthPage onLogin={handleLogin} onRegister={handleRegister} />}
      {authReady && view === 'browse' && user && (
        <BrowsePage
          tools={filteredTools.filter((tool) => !ownsTool(tool))}
          totalTools={nearbyTools.length}
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          availableOnly={availableOnly}
          onAvailabilityChange={setAvailableOnly}
          likedOnly={likedOnly}
          onLikedChange={setLikedOnly}
          onBorrow={setSelectedTool}
          loading={loading}
          categories={categories}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}
      {authReady && view === 'requests' && user && <MyRequestsPage requests={myRequests} onBrowse={() => setView('browse')} onChat={openChat} />}
      {authReady && view === 'lender' && user && (
        <LenderPage
          user={user}
          tools={canSeeAdmin ? tools : nearbyTools}
          myTools={myTools}
          requests={requests}
          onBorrow={setSelectedTool}
          onUpdate={updateRequest}
          onAdd={() => setShowAddTool(true)}
          onChat={openChat}
        />
      )}
      {authReady && view === 'profile' && user && <ProfilePage user={user} requests={myRequests} tools={tools} />}
      {authReady && view === 'admin' && user && <AdminPage user={user} />}

      {selectedTool && user && (
        <BorrowModal tool={selectedTool} onClose={() => setSelectedTool(null)} onSubmit={submitBorrow} />
      )}
      {showAddTool && user && <AddToolModal onClose={() => setShowAddTool(false)} onSubmit={addTool} categories={categories} />}
      {chatRequest && user && (
        <ChatModal request={chatRequest} user={user} onClose={closeChat} />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default App;
