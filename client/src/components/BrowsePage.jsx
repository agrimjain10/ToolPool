import ToolCard from './ToolCard';
import { categories } from '../data';

function BrowsePage({
  tools,
  totalTools,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  availableOnly,
  onAvailabilityChange,
  onBorrow
}) {
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
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search by tool, category or area"
            />
          </label>
          <label className="availability-toggle">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => onAvailabilityChange(event.target.checked)}
            />
            <span>Available now</span>
          </label>
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

        {tools.length > 0 ? (
          <div className="tool-grid">
            {tools.map((tool) => <ToolCard key={tool.id} tool={tool} onBorrow={onBorrow} />)}
          </div>
        ) : (
          <div className="empty-state"><strong>No tools found</strong><p>Try a different category or search term.</p></div>
        )}
      </section>
    </main>
  );
}

export default BrowsePage;
