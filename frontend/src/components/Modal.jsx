import React from 'react'
import { Modal as BsModal } from 'react-bootstrap'

export default function Modal({ show, onHide, title, children, footer }) {
  return (
    <BsModal show={show} onHide={onHide} centered contentClassName="glass-strong border-0">
      <BsModal.Header closeButton closeVariant="white" className="border-0">
        <BsModal.Title className="font-display fw-bold" style={{ fontSize: '1.1rem' }}>{title}</BsModal.Title>
      </BsModal.Header>
      <BsModal.Body>{children}</BsModal.Body>
      {footer && <BsModal.Footer className="border-0">{footer}</BsModal.Footer>}
    </BsModal>
  )
}
