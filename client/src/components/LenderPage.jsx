import PageTitle from './PageTitle';
import Status from './Status';
import { initials } from '../helpers';

function LenderPage({ user, tools, myTools, requests, onBorrow, onUpdate, onAdd, onChat }) {
  const currentName = user?.name || 'Guest User';
  const lenderRequests = user?.role === 'admin'
    ? requests
    : requests.filter((request) => request.toolId?.owner === currentName || request.toolOwner === currentName);

  const visibleTools = user?.role === 'admin' ? tools : tools.filter((tool) => tool.owner !== currentName);

  return (
    <main className="page-wrap">
      <div className="title-actions">
        <PageTitle
          eyebrow="Lender dashboard"
          title="My workshop"
          copy="Manage your tools and respond to neighbours."
        />
        <button className="primary-action" onClick={onAdd}>+ Add a tool</button>
      </div>

      <div className="stats-strip">
        <div><strong>{myTools.length}</strong><span>Listed tools</span></div>
        <div><strong>{lenderRequests.filter((item) => item.status === 'Pending').length}</strong><span>New requests</span></div>
        <div><strong>{lenderRequests.filter((item) => item.status === 'Returned').length}</strong><span>Successful shares</span></div>
        <div><strong>4.9</strong><span>Neighbour rating</span></div>
      </div>

      <section className="dashboard-section">
        <div className="section-heading">
          <div><h2>Tools you can borrow</h2><p>{visibleTools.length} tools from other users.</p></div>
        </div>
        <div className="tool-grid">
          {visibleTools.map((tool) => (
            <article className="tool-card" key={tool.id}>
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
                  <button disabled={!tool.available} onClick={() => onBorrow(tool)}>
                    {tool.available ? 'Borrow' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div><h2>My tools</h2><p>Your own listings.</p></div>
        </div>
        <div className="tool-grid">
          {myTools.map((tool) => (
            <article className="tool-card" key={tool.id}>
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
                  <button disabled>{tool.available ? 'Your listing' : 'Borrowed out'}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div><h2>Borrow requests</h2><p>Review dates and messages before approving.</p></div>
        </div>

        <div className="request-list">
          {lenderRequests.map((request) => (
            <article className="request-row lender-row" key={request.id}>
              <div className="request-icon">{initials(request.borrower)}</div>
              <div className="request-main">
                <strong>{request.borrower} wants your {request.tool}</strong>
                <span>{request.dates}</span>
                <p>“{request.message}”</p>
              </div>
              <div className="lender-actions">
                <Status status={request.status} />
                {request.status === 'Pending' && (
                  <>
                    <button className="quiet-button" onClick={() => onUpdate(request.id, 'Declined')}>Decline</button>
                    <button onClick={() => onUpdate(request.id, 'Approved')}>Approve</button>
                  </>
                )}
                {request.status === 'Approved' && (
                  <>
                    <button className="quiet-button" onClick={() => onChat(request)}>Chat</button>
                    <button onClick={() => onUpdate(request.id, 'Returned')}>Mark returned</button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LenderPage;
