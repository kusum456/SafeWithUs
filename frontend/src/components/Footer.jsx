import React from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiInstagram, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="pt-5 pb-4 mt-5" style={{ borderTop: '1px solid var(--border-soft)' }}>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
                <FiShield color="#08111a" size={16} />
              </span>
              <span className="font-display fw-bold">SafeWithUs</span>
            </div>
            <p className="text-muted-swu" style={{ maxWidth: 320, fontSize: '0.9rem' }}>
              A next-generation personal safety platform — emergency response, live location and a trusted circle, always within reach.
            </p>
            <div className="d-flex gap-3 mt-3">
              {[FiInstagram, FiTwitter, FiFacebook, FiLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="d-flex align-items-center justify-content-center glass" style={{ width: 36, height: 36, borderRadius: 10, color: 'var(--text-muted)' }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          <div className="col-6 col-lg-2">
            <div className="eyebrow mb-3">Product</div>
            <a href="#about" className="d-block swu-nav-link px-0 mb-2">About</a>
            <a href="#features" className="d-block swu-nav-link px-0 mb-2">Features</a>
            <a href="#" className="d-block swu-nav-link px-0 mb-2">Safety</a>
          </div>
          <div className="col-6 col-lg-2">
            <div className="eyebrow mb-3">Legal</div>
            <a href="#" className="d-block swu-nav-link px-0 mb-2">Privacy</a>
            <a href="#" className="d-block swu-nav-link px-0 mb-2">Terms</a>
          </div>
          <div className="col-6 col-lg-2">
            <div className="eyebrow mb-3">Company</div>
            <a href="#contact" className="d-block swu-nav-link px-0 mb-2">Contact</a>
            <Link to="/login" className="d-block swu-nav-link px-0 mb-2">Login</Link>
          </div>
        </div>
        <hr className="divider-glow my-4" />
        <div className="d-flex flex-wrap justify-content-between text-faint-swu" style={{ fontSize: '0.8rem' }}>
          <span>© {new Date().getFullYear()} SafeWithUs. All rights reserved.</span>
          <span className="font-mono">BUILT FOR SAFETY, EVERYWHERE.</span>
        </div>
      </div>
    </footer>
  )
}
