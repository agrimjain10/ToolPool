function ProfilePage({ requests, tools }) {
  const sharedTools = tools.filter((tool) => tool.owner === 'Agrim Jain').length;

  return (
    <main className="page-wrap profile-page">
      <section className="profile-head">
        <div className="profile-avatar">AJ</div>
        <div>
          <p className="eyebrow">Community member</p>
          <h1>Agrim Jain</h1>
          <p>Vijay Nagar, Indore · Member since March 2026</p>
        </div>
      </section>

      <div className="profile-grid">
        <section>
          <h2>Community record</h2>
          <div className="profile-facts">
            <div><strong>4.9</strong><span>Rating</span></div>
            <div><strong>{requests.length + 8}</strong><span>Borrows</span></div>
            <div><strong>{sharedTools + 3}</strong><span>Tools shared</span></div>
          </div>
        </section>
        <section>
          <h2>About</h2>
          <p>Weekend DIY enthusiast. Usually available for handovers after 6 PM and happy to help with basic setup.</p>
          <div className="verified-row"><span>✓ Phone verified</span><span>✓ Address verified</span></div>
        </section>
      </div>
    </main>
  );
}

export default ProfilePage;
