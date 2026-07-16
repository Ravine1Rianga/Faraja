import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo"><span className="footer-logo-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4C12 4 8 2 4 5C0 8 0 14 4 18L12 22L20 18C24 14 24 8 20 5C16 2 12 4 12 4Z"/><path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5"/></svg></span> Fa<span>raja</span></div>
            <p className="footer-desc">Kenya's all-in-one digital funeral planning platform. Transparent harambee fundraising, verified vendors, and beautiful digital memorials.</p>
          </div>
          <div>
            <div className="footer-col-title">Platform</div>
            <Link to="/dashboard" className="footer-link">Funeral Dashboard</Link>
            <Link to="/donate" className="footer-link">Make a Donation</Link>
            <Link to="/funerals/new" className="footer-link">Create a Memorial</Link>
            <Link to="/vendors" className="footer-link">Vendor Marketplace</Link>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Print Studio</a>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <a href="/#about" className="footer-link">About Us</a>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Blog</a>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Careers</a>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Press</a>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Contact</a>
          </div>
          <div>
            <div className="footer-col-title">Legal</div>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Privacy Policy</a>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Terms of Service</a>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Cookie Policy</a>
            <a href="javascript:void(0)" className="footer-link" title="Coming soon">Refund Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Faraja</p>
          <div className="footer-socials">
            <a href="javascript:void(0)" className="footer-social" title="Facebook">f</a>
            <a href="javascript:void(0)" className="footer-social" title="Twitter/X">𝕏</a>
            <a href="javascript:void(0)" className="footer-social" title="Instagram">ig</a>
            <a href="javascript:void(0)" className="footer-social" title="WhatsApp">wa</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
