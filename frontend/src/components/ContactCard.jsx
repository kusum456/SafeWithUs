import React from 'react'
import { FiPhone, FiEdit2, FiTrash2 } from 'react-icons/fi'

export default function ContactCard({ contact, onEdit, onDelete }) {
  return (
    <div className="glass glass-card">
      <div className="d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center font-mono"
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color: '#08111a', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
          }}
        >
          {contact.initials}
        </div>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2">
            <strong>{contact.name}</strong>
            <span className={`status-dot ${contact.status === 'online' ? 'on' : 'off'}`} />
          </div>
          <div className="text-muted-swu" style={{ fontSize: '0.85rem' }}>{contact.relation} · {contact.priority}</div>
          <div className="font-mono text-faint-swu" style={{ fontSize: '0.78rem' }}>{contact.phone}</div>
        </div>
      </div>
      <div className="d-flex gap-2 mt-3">
        <a href={`tel:${contact.phone}`} className="btn btn-sm btn-swu-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1">
          <FiPhone size={13} /> Call
        </a>
        <button className="btn btn-sm btn-swu-ghost" onClick={() => onEdit?.(contact)} type="button"><FiEdit2 size={13} /></button>
        <button className="btn btn-sm btn-swu-ghost" onClick={() => onDelete?.(contact.id)} type="button"><FiTrash2 size={13} /></button>
      </div>
    </div>
  )
}
