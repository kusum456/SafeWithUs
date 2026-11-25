import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'

export default function MainLayout({ children }) {
  return (
    <div className="swu-app-bg">
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </div>
  )
}
