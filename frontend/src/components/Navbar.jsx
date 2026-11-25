import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiShield, FiMenu, FiX } from 'react-icons/fi'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`swu-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <span
            className="d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            <FiShield color="#08111a" size={18} />
          </span>
          <span className="font-display fw-bold" style={{ color: 'var(--text)', fontSize: '1.15rem' }}>SafeWithUs</span>
        </Link>

        <div className="d-none d-lg-flex align-items-center">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="swu-nav-link">{l.label}</a>
          ))}
        </div>

        <div className="d-none d-lg-flex align-items-center gap-3">
          <ThemeToggle />
          <button className="btn-swu-ghost btn" onClick={() => navigate('/login')} type="button">Login</button>
          <button className="btn-swu-primary btn" onClick={() => navigate('/register')} type="button">Get Started</button>
        </div>

        <div className="d-lg-none d-flex align-items-center gap-2">
          <ThemeToggle />
          <button className="btn btn-swu-ghost" onClick={() => setOpen(!open)} type="button" aria-label="Menu">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="d-lg-none glass mt-3 mx-3 p-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="d-block swu-nav-link py-2" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-swu-ghost flex-grow-1" onClick={() => navigate('/login')} type="button">Login</button>
            <button className="btn btn-swu-primary flex-grow-1" onClick={() => navigate('/register')} type="button">Get Started</button>
          </div>
        </div>
      )}
    </nav>
  )
}
