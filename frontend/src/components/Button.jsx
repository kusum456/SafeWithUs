import React from 'react'

const variants = {
  primary: 'btn-swu-primary',
  ghost: 'btn-swu-ghost',
  danger: 'btn-swu-danger',
}

export default function Button({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <button className={`btn ${variants[variant] || variants.primary} ${className}`} {...rest}>
      {children}
    </button>
  )
}
