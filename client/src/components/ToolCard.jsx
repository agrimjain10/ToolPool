import { initials } from '../helpers';

function ToolCard({ tool, onBorrow }) {
  return (
    <article className="tool-card">
      <div className="tool-image-wrap">
        <img src={tool.image} alt={tool.name} />
        <span className={`availability ${tool.available ? '' : 'busy'}`}>
          {tool.available ? 'Available' : 'Borrowed'}
        </span>
      </div>

      <div className="tool-content">
        <div className="tool-category">
          {tool.category}
          <span style={{ marginLeft: '8px', padding: '2px 6px', background: '#e0e0e0', color: '#333', borderRadius: '4px', fontSize: '10px' }}>
            {tool.condition || 'Good'}
          </span>
        </div>
        <h3>{tool.name}</h3>
        <p className="tool-description">{tool.description}</p>

        <div className="owner-line">
          <span className="owner-avatar">{initials(tool.owner)}</span>
          <span><strong>{tool.owner}</strong><small>★ {tool.rating} · {tool.distance}</small></span>
        </div>

        <div className="tool-footer">
          <span><strong>₹{tool.deposit}</strong><small> refundable deposit</small></span>
          {onBorrow ? (
            <button disabled={!tool.available} onClick={() => onBorrow(tool)}>
              {tool.available ? 'Request tool' : 'Unavailable'}
            </button>
          ) : (
            <button disabled>Your listing</button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ToolCard;
