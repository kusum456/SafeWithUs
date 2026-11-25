import React from 'react'
import Swal from 'sweetalert2'
import { FiAlertTriangle } from 'react-icons/fi'

export default function SOSButton({ onActivate, size = 240 }) {
  const handlePress = async () => {
    const result = await Swal.fire({
      title: 'Activate Emergency SOS?',
      text: 'Your live location will be shared instantly with all trusted contacts and local emergency services.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Activate SOS',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ff4d5e',
      cancelButtonColor: '#5b6472',
      background: 'var(--bg-elevated)',
      color: 'var(--text)',
      customClass: { popup: 'glass-strong' },
    })
    if (result.isConfirmed) {
      onActivate?.()
      Swal.fire({
        title: 'SOS Activated',
        text: 'Your trusted contacts and nearby responders have been notified.',
        icon: 'success',
        confirmButtonColor: '#26e0c9',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })
    }
  }

  return (
    <div className="sos-wrap" style={{ width: size, height: size }}>
      <span className="sos-ring" />
      <span className="sos-ring r2" />
      <span className="sos-ring r3" />
      <button className="sos-btn" onClick={handlePress} type="button" aria-label="Activate emergency SOS">
        <FiAlertTriangle size={30} />
        SOS
        <span className="sub">press for emergency</span>
      </button>
    </div>
  )
}
