import React, { useState } from 'react'
import { FiMenu, FiBell } from 'react-icons/fi'
import Sidebar from '../components/Sidebar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { user } from '../data/mockData.js'

export default function DashboardLayout({ children, title, subtitle }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="swu-app-bg d-flex">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open && <div className="d-lg-none" onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 800 }} />}
      <main className="flex-grow-1" style={{ minWidth: 0 }}>
        <header className="d-flex align-items-center justify-content-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-swu-ghost d-lg-none" onClick={() => setOpen(true)} type="button"><FiMenu /></button>
            <div>
              <h5 className="mb-0 font-display fw-bold">{title}</h5>
              {subtitle && <div className="text-muted-swu" style={{ fontSize: '0.85rem' }}>{subtitle}</div>}
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-swu-ghost position-relative" type="button">
              <FiBell size={16} />
              <span style={{ position: 'absolute', top: 6, right: 8, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)' }} />
            </button>
            <div
              className="d-flex align-items-center justify-content-center font-mono"
              style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: '#08111a', fontWeight: 700, fontSize: '0.8rem' }}
            >
              {user.avatar}
            </div>
          </div>
        </header>
        <div className="p-4">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}
