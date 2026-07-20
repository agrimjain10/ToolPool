import heroImg from '../hero.jpg';

function LandingPage({ onLogin }) {
  return (
    <main className="landing-page one-fold-layout">
      <div className="hero-container">
        <div className="hero-content">
          <span className="badge">Neighbourhood sharing platform</span>
          <h1 className="hero-title">
            Borrow what you need.<br />
            <span className="gradient-text">Share what you own.</span>
          </h1>
          <p className="hero-subtitle">
            ToolPool connects you with verified neighbors so you can share tools, save money, and build a stronger community. Simple, secure, and right next door.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onLogin}>Get Started</button>
            <button className="btn btn-secondary" onClick={onLogin}>Explore Tools</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-wrapper">
            <img src={heroImg} alt="Neighborhood tool sharing illustration" className="hero-image" />
            <div className="floating-card card-1">
              <span className="icon">🛠️</span>
              <div>
                <h4>Drill Machine</h4>
                <p>Borrowed by Rohan</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <span className="icon">🌱</span>
              <div>
                <h4>Lawn Mower</h4>
                <p>Lent by Suresh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LandingPage;