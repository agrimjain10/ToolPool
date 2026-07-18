function LandingPage({ onLogin }) {
  return (
    <main className="landing-page">
      <section className="intro-band landing-band">
        <div className="intro-copy">
          <p className="eyebrow">Neighbourhood tool sharing</p>
          <h1>Borrow what you need. Share what you own.</h1>
          <p>
            ToolPool is a real MERN app backed by MongoDB, Express, React, and Node.
            Sign in to list tools, send requests, and manage everything in one place.
          </p>
          <div className="landing-actions">
            <button className="primary-action" onClick={onLogin}>Login</button>
            <button className="text-action" onClick={onLogin}>Create account</button>
          </div>
        </div>
        <div className="community-note landing-note">
          <strong>Real stack</strong>
          <span>MongoDB + Express + React + Node</span>
        </div>
      </section>

      <section className="browse-section landing-section">
        <div className="landing-grid">
          <article className="feature-card">
            <p className="eyebrow">Login</p>
            <h2>Account-backed access</h2>
            <p>Your session lives in MongoDB, so sign-in and sign-out are real server-side actions.</p>
          </article>
          <article className="feature-card">
            <p className="eyebrow">List tools</p>
            <h2>Create your workshop</h2>
            <p>Add tools from the UI and store them in the database, not in a temporary demo list.</p>
          </article>
          <article className="feature-card">
            <p className="eyebrow">Borrow</p>
            <h2>Request through the API</h2>
            <p>Borrow requests are written to MongoDB and tied to the authenticated user session.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;