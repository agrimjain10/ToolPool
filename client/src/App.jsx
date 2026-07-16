import { useMemo, useState } from 'react';
import Header from './components/Header';
import AddToolModal from './components/AddToolModal';
import BorrowModal from './components/BorrowModal';
import BrowsePage from './components/BrowsePage';
import LenderPage from './components/LenderPage';
import MyRequestsPage from './components/MyRequestsPage';
import ProfilePage from './components/ProfilePage';
import { starterRequests, starterTools } from './data';
import { formatDate, loadLocal } from './helpers';

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
      const searchText = `${tool.name} ${tool.category} ${tool.area}`.toLowerCase();
      const matchesText = !term || searchText.includes(term);
      const matchesCategory = category === 'All' || tool.category === category;
      const matchesAvailability = !availableOnly || tool.available;

      return matchesText && matchesCategory && matchesAvailability;
    });
  }, [tools, query, category, availableOnly]);

  function saveTools(nextTools) {
    setTools(nextTools);
    localStorage.setItem('toolpool-tools', JSON.stringify(nextTools));
  }

  function saveRequests(nextRequests) {
    setRequests(nextRequests);
    localStorage.setItem('toolpool-requests', JSON.stringify(nextRequests));
  }

  function showMessage(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function submitBorrow(tool, form) {
    const newRequest = {
      id: Date.now(),
      toolId: tool.id,
      tool: tool.name,
      borrower: 'Agrim Jain',
      dates: `${formatDate(form.from)} - ${formatDate(form.to)}`,
      message: form.message,
      status: 'Pending'
    };

    saveRequests([newRequest, ...requests]);
    setSelectedTool(null);
    setView('requests');
    showMessage('Request sent to the owner');
  }

  function updateRequest(id, status) {
    const updatedRequests = requests.map((request) =>
      request.id === id ? { ...request, status } : request
    );

    saveRequests(updatedRequests);
    showMessage(status === 'Approved' ? 'Borrow request approved' : `Request marked ${status.toLowerCase()}`);
  }

  function addTool(tool) {
    const newTool = {
      ...tool,
      id: Date.now(),
      owner: 'Agrim Jain',
      rating: 5,
      available: true
    };

    saveTools([newTool, ...tools]);
    setShowAddTool(false);
    setView('lender');
    showMessage('Tool added to your workshop');
  }

  return (
    <div className="app-shell">
      <Header view={view} onNavigate={setView} onAdd={() => setShowAddTool(true)} />

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
        />
      )}
      {view === 'requests' && <MyRequestsPage requests={myRequests} onBrowse={() => setView('browse')} />}
      {view === 'lender' && (
        <LenderPage
          tools={tools}
          requests={requests}
          onUpdate={updateRequest}
          onAdd={() => setShowAddTool(true)}
        />
      )}
      {view === 'profile' && <ProfilePage requests={myRequests} tools={tools} />}

      {selectedTool && (
        <BorrowModal tool={selectedTool} onClose={() => setSelectedTool(null)} onSubmit={submitBorrow} />
      )}
      {showAddTool && <AddToolModal onClose={() => setShowAddTool(false)} onSubmit={addTool} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default App;
