import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh', background: 'var(--bg)' }}>
      <div
        style={{
          width: 56, height: 56, borderRadius: '50%',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.9s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="font-mono text-muted-swu mt-3" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>SECURING CONNECTION…</div>
    </div>
  )
}
