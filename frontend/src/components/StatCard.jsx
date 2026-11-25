import React from 'react'
import { useCountUp } from '../hooks/useCountUp.js'

export default function StatCard({ label, value, suffix = '' }) {
  const [ref, count] = useCountUp(value)
  return (
    <div ref={ref} className="glass glass-card text-center py-4">
      <div className="font-mono text-accent" style={{ fontSize: '2.6rem', fontWeight: 700, lineHeight: 1 }}>
        {count}
        <span style={{ fontSize: '1.4rem' }}>{suffix}</span>
      </div>
      <div className="text-muted-swu mt-2" style={{ fontSize: '0.9rem' }}>{label}</div>
    </div>
  )
}
