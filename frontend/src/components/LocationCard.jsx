import React from 'react'
import { FiMapPin, FiClock, FiTarget } from 'react-icons/fi'

export default function LocationCard({ location }) {
  return (
    <div className="glass glass-card">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="mb-0 d-flex align-items-center gap-2"><FiMapPin className="text-accent" /> Current Location</h6>
        <span className="status-dot on" />
      </div>
      <div className="font-mono" style={{ fontSize: '0.85rem' }}>
        <div className="d-flex justify-content-between py-1 border-bottom border-secondary-subtle">
          <span className="text-muted-swu">Latitude</span><span>{location.lat.toFixed(4)}</span>
        </div>
        <div className="d-flex justify-content-between py-1 border-bottom border-secondary-subtle">
          <span className="text-muted-swu">Longitude</span><span>{location.lng.toFixed(4)}</span>
        </div>
        <div className="d-flex justify-content-between py-1 border-bottom border-secondary-subtle">
          <span className="text-muted-swu"><FiTarget size={12} /> Accuracy</span><span>{location.accuracy}</span>
        </div>
        <div className="d-flex justify-content-between py-1">
          <span className="text-muted-swu"><FiClock size={12} /> Updated</span><span>{location.updated}</span>
        </div>
      </div>
      <div className="text-center mt-3 text-accent" style={{ fontSize: '0.85rem' }}>{location.label}</div>
    </div>
  )
}
