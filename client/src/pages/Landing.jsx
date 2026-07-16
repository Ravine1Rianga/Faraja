import Icon from '../components/ui/Icon'

export default function Landing() {
  return (
    <>
      <section className="hero" id="home">
        <div className="hero-bg-lines"></div>
        <div className="container">
          <div className="hero-content" style={{ maxWidth: 700, paddingTop: 80 }}>
            <div className="hero-eyebrow animate-fade-up"><Icon name="dove" /> Dignified Farewells, Simplified</div>
            <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Planning a <span className="text-gold">funeral</span> shouldn't add to your grief
            </h1>
            <p className="hero-desc animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Faraja is Kenya's all-in-one platform for funeral planning, harambee fundraising, vendor bookings, and digital memorials.
            </p>
            <div className="hero-actions animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <a href="/register" className="btn btn-primary btn-lg">Get Started Free</a>
              <a href="/#how-it-works" className="btn btn-ghost btn-lg">How It Works</a>
            </div>
            <div className="hero-stats animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="hero-stat"><strong>500+</strong> Memorials Created</div>
              <div className="hero-stat"><strong>2M+</strong> KES Raised</div>
              <div className="hero-stat"><strong>50+</strong> Verified Vendors</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need, in one place</h2>
          <div className="grid grid-2" style={{ marginTop: 48 }}>
            {[
              { icon: 'heart', title: 'Harambee Fundraising', desc: 'Transparent contributions with real-time tracking — M-PESA integration coming soon. Share the link with family near and far.' },
              { icon: 'store', title: 'Verified Vendor Network', desc: 'Browse and book trusted funeral service providers — from caskets to catering to PA systems.' },
              { icon: 'dove', title: 'Digital Memorials', desc: 'Beautiful tribute pages with photos, gallery, biography, and an interactive order of service.' },
              { icon: 'clipboard-list', title: 'Committee & Task Management', desc: 'Assign roles, track tasks with a Kanban board, and keep everyone coordinated.' },
              { icon: 'globe', title: 'Diaspora Engagement', desc: 'Kenyan families abroad can contribute via card, follow proceedings in real time, and receive the digital order of service.' },
              { icon: 'printer', title: 'Print Studio', desc: 'Generate professional Matanga posters and order-of-service booklets with our easy-to-use template editor.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon"><Icon name={f.icon} size={28} /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark" id="how-it-works">
        <div className="container">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Three simple steps</h2>
          <div className="steps" style={{ marginTop: 48 }}>
            {[
              { step: '1', title: 'Create a Memorial', desc: 'Set up a tribute page with the deceased\'s details, photo, and fundraising goal.' },
              { step: '2', title: 'Invite Family & Friends', desc: 'Share the memorial link via WhatsApp. They can contribute, book vendors, and leave messages.' },
              { step: '3', title: 'Coordinate the Farewell', desc: 'Manage the committee, track tasks, order flowers, and generate the order of service — all from one dashboard.' },
            ].map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-number">{s.step}</div>
                <div className="step-content">
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container">
          <div className="section-label">About Faraja</div>
          <h2 className="section-title">Built for Kenyan families,<br />by Kenyans</h2>
          <p style={{ maxWidth: 600, marginTop: 16 }}>
            Faraja was born from the recognition that planning a funeral in Kenya involves coordinating dozens of moving parts — from harambee fundraising to vendor bookings to family communication. We bring everything together so you can focus on what matters most: honouring your loved one.
          </p>
        </div>
      </section>

      <section className="section section-dark" id="testimonials">
        <div className="container">
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">What families say</h2>
          <div className="grid grid-3" style={{ marginTop: 48 }}>
            {[
              { quote: 'Faraja made it so easy for our family abroad to contribute. We raised over 300K in just 3 days.', name: 'Mary W., Nairobi' },
              { quote: 'The vendor directory saved us so much time. We found a caterer and PA system in one afternoon.', name: 'James K., Mombasa' },
              { quote: 'The digital memorial was beautiful. Our relatives in the US could see the order of service in real time.', name: 'Grace N., Nakuru' },
            ].map((t, i) => (
              <div key={i} className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <p className="testimonial-author">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section" id="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to plan a dignified farewell?</h2>
            <p className="cta-desc">Join hundreds of Kenyan families using Faraja.</p>
            <a href="/register" className="btn btn-primary btn-lg">Get Started Free <Icon name="arrow-right" /></a>
          </div>
        </div>
      </section>
    </>
  )
}
