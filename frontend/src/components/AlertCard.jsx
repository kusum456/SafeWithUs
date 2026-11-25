import React from 'react'
import { FiAlertCircle, FiMapPin, FiShield, FiSettings, FiTrash2, FiCheck } from 'react-icons/fi'

const iconMap = {
  Emergency: FiAlertCircle,
  Location: FiMapPin,
  Safety: FiShield,
  System: FiSettings,
}
const levelColor = { high: 'danger', medium: 'warn', low: 'on' }

export default function AlertCard({ alert, onRead, onDelete }) {
  const Icon = iconMap[alert.category] || FiAlertCircle
  return (
    <div className={`glass d-flex align-items-start gap-3 p-3 mb-3 ${alert.read ? '' : 'border-accent'}`} style={{ opacity: alert.read ? 0.7 : 1 }}>
      <div
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface-strong)' }}
      >
        <Icon size={18} className="text-accent" />
      </div>
      <div className="flex-grow-1">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className={`status-dot ${levelColor[alert.level]}`} />
          <strong style={{ fontSize: '0.95rem' }}>{alert.title}</strong>
        </div>
        <div className="text-muted-swu" style={{ fontSize: '0.85rem' }}>{alert.desc}</div>
        <div className="font-mono text-faint-swu mt-1" style={{ fontSize: '0.72rem' }}>{alert.category} · {alert.time}</div>
      </div>
      <div className="d-flex gap-2">
        {!alert.read && (
          <button className="btn btn-sm btn-swu-ghost" onClick={() => onRead?.(alert.id)} title="Mark as read" type="button">
            <FiCheck size={14} />
          </button>
        )}
        <button className="btn btn-sm btn-swu-ghost" onClick={() => onDelete?.(alert.id)} title="Delete" type="button">
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  )
}
