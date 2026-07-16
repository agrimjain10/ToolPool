import PageTitle from './PageTitle';
import Status from './Status';
import { initials } from '../helpers';

function LenderPage({ tools, requests, onUpdate, onAdd }) {
  const lenderRequests = requests.filter((request) => request.borrower !== 'Agrim Jain');
  const ownTools = tools.filter((tool) => tool.owner === 'Agrim Jain');

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
        <div><strong>{ownTools.length || 3}</strong><span>Listed tools</span></div>
        <div><strong>{lenderRequests.filter((item) => item.status === 'Pending').length}</strong><span>New requests</span></div>
        <div><strong>12</strong><span>Successful shares</span></div>
        <div><strong>4.9</strong><span>Neighbour rating</span></div>
      </div>

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
                  <button onClick={() => onUpdate(request.id, 'Returned')}>Mark returned</button>
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
