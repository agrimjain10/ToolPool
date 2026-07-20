import heroImg from '../hero.jpg';

function LandingPage({ onLogin }) {
  return (
    <main className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="badge">Neighbourhood sharing platform</span>
            <h1 className="hero-title">
              Borrow what you need.<br />
              <span className="gradient-text">Share what you own.</span>
            </h1>
            <p className="hero-subtitle">
              Don't buy items you'll only use once. ToolPool connects you with verified neighbors so you can share tools, save money, and build a stronger community.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={onLogin}>Get Started</button>
              <button className="btn btn-secondary" onClick={onLogin}>Explore Marketplace</button>
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
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <h3>500+</h3>
            <p>Tools Listed</p>
          </div>
          <div className="stat-card">
            <h3>₹75k+</h3>
            <p>Money Saved</p>
          </div>
          <div className="stat-card">
            <h3>120+</h3>
            <p>Active Neighbors</p>
          </div>
          <div className="stat-card">
            <h3>4.9★</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <span className="badge">Simple Process</span>
          <h2>How ToolPool Works</h2>
          <p>Get the tools you need for any project in three simple steps.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>List Your Tools</h3>
            <p>Got tools lying around? Post them in seconds, set a refundable deposit, and help out your community.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Request to Borrow</h3>
            <p>Browse local listings for lawnmowers, drills, or ladders. Request the dates you need and wait for owner approval.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Meet Up & Return</h3>
            <p>Meet your neighbor, exchange the tool safely, complete your project, and return it. Simple and eco-friendly!</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="badge">Testimonials</span>
          <h2>What Neighbors Say</h2>
          <p>Read real stories from members of our ToolPool community.</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="quote">"Needed a heavy-duty drill to mount my TV. Saved over ₹2,000 by borrowing from Rohan for a day. This platform is an absolute lifesaver!"</p>
            <div className="author">
              <strong>Priya Sharma</strong>
              <span>Vijay Nagar Resident</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="quote">"I listed my lawnmower that was just sitting in my garage. I've lent it out 4 times, met some amazing neighbors, and made back what I spent on it."</p>
            <div className="author">
              <strong>Suresh Kumar</strong>
              <span>Vijay Nagar Resident</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to build a sharing neighborhood?</h2>
          <p>Create a free account today to start borrowing and lending tools safely with verified community members.</p>
          <button className="btn btn-primary btn-large" onClick={onLogin}>Join ToolPool Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>ToolPool</h3>
            <p>Building trusted neighborhood sharing networks, one tool at a time.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Platform</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }}>Browse Tools</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }}>Lend a Tool</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }}>Safety Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4>Community</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }}>About Us</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }}>Terms of Service</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); }}>Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ToolPool. Built as an MCA project. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;