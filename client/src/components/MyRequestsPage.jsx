import PageTitle from './PageTitle';
import Status from './Status';

function MyRequestsPage({ requests, onBrowse, onChat }) {
  return (
    <main className="page-wrap">
      <PageTitle
        eyebrow="Borrowing"
        title="My requests"
        copy="Everything you have requested from neighbours, in one place."
      />

      {requests.length ? (
        <div className="request-list">
          {requests.map((request) => (
            <article className="request-row" key={request.id}>
              <div className="request-icon">{request.tool.slice(0, 1)}</div>
              <div className="request-main">
                <strong>{request.tool}</strong>
                <span>{request.dates}</span>
                <p>{request.message}</p>
              </div>
              <div className="request-actions">
                <Status status={request.status} />
                {request.status === 'Approved' && (
                  <button className="quiet-button" onClick={() => onChat(request)}>Chat</button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No requests yet</strong>
          <p>Your borrowing requests will appear here.</p>
          <button onClick={onBrowse}>Browse tools</button>
        </div>
      )}
    </main>
  );
}

export default MyRequestsPage;
