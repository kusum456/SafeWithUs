import React from 'react'
import { FiEdit2 } from 'react-icons/fi'

export default function ProfileCard({ user, onEdit }) {
  return (
    <div className="glass glass-card text-center">
      <div
        className="d-flex align-items-center justify-content-center font-mono mx-auto mb-3"
        style={{ width: 92, height: 92, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: '#08111a', fontWeight: 700, fontSize: '1.8rem' }}
      >
        {user.avatar}
      </div>
      <h5 className="fw-bold mb-1">{user.name}</h5>
      <div className="text-muted-swu mb-3">{user.username}</div>
      <button className="btn btn-swu-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={onEdit} type="button">
        <FiEdit2 size={14} /> Edit Profile
      </button>
    </div>
  )
}
