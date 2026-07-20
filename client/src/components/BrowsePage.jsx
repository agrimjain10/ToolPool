import ToolCard from './ToolCard';

function BrowsePage({
  tools,
  totalTools,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  availableOnly,
  onAvailabilityChange,
  likedOnly,
  onLikedChange,
  onBorrow,
  loading,
  categories,
  favorites = [],
  onToggleFavorite
}) {
  return (
    <main>
      <section className="intro-band">
        <div className="intro-copy">
          <p className="eyebrow">Your neighbourhood workshop</p>
          <h1>Build a real borrowing network for your city.</h1>
          <p>List tools, request what you need, and manage everything through your own MongoDB-backed workspace.</p>
        </div>
        <div className="community-note">
          <strong>{totalTools} tools</strong>
          <span>{totalTools > 0 ? 'currently available in the marketplace' : 'nothing listed yet - be the first to add one'}</span>
        </div>
      </section>

      <section className="browse-section">
        <div className="search-row">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by tool, category or area"
            />
          </label>
          <div className="filter-checkboxes">
            <label className="availability-toggle">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) => onAvailabilityChange(event.target.checked)}
              />
              <span>Available now</span>
            </label>
            <label className="availability-toggle liked-toggle">
              <input
                type="checkbox"
                checked={likedOnly}
                onChange={(event) => onLikedChange(event.target.checked)}
              />
              <span>❤️ Liked only</span>
            </label>
          </div>
        </div>

        <div className="category-list" aria-label="Tool categories">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="section-heading">
          <div><h2>Tools near you</h2><p>{tools.length} matches within your neighbourhood</p></div>
          <select aria-label="Sort tools" defaultValue="nearest">
            <option value="nearest">Nearest first</option>
            <option value="rating">Top rated</option>
            <option value="deposit">Lowest deposit</option>
          </select>
        </div>

        {loading ? (
          <div className="empty-state"><strong>Loading tools</strong><p>Fetching latest tools from backend.</p></div>
        ) : tools.length > 0 ? (
          <div className="tool-grid">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onBorrow={onBorrow}
                isFavorited={favorites.includes(tool.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No tools listed yet</strong>
            <p>Use the add-tool flow to create the first real listing in your database.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default BrowsePage;
