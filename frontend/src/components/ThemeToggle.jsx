import React from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      type="button"
    >
      <span className="knob">{theme === 'dark' ? <FiMoon size={12} /> : <FiSun size={12} />}</span>
    </button>
  )
}
