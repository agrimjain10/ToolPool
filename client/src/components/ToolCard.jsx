import { initials } from '../helpers';

function ToolCard({ tool, onBorrow, isFavorited, onToggleFavorite }) {
  return (
    <article className="tool-card">
      <div className="tool-image-wrap">
        <img src={tool.image} alt={tool.name} />
        <span className={`availability ${tool.available ? '' : 'busy'}`}>
          {tool.available ? 'Available' : 'Borrowed'}
        </span>
        {onToggleFavorite && (
          <button className={`favorite-btn ${isFavorited ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleFavorite(tool.id); }} aria-label="Favorite tool">
            {isFavorited ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div className="tool-content">
        <div className="tool-category">
          {tool.category}
          <span style={{ marginLeft: '8px', padding: '2px 6px', background: '#e8ecea', color: '#143e32', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>
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
