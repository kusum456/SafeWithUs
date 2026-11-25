import React from 'react'

export default function GlassCard({ children, className = '', style, as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`glass glass-card ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  )
}
