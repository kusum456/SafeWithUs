import React, { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiGrid,
  FiAlertTriangle,
  FiMapPin,
  FiUsers,
  FiBell,
  FiShield,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
} from 'react-icons/fi'

import ThemeToggle from './ThemeToggle.jsx'
import {
  getProfile,
  logoutUser,
} from '../services/authService'


// ============================================================
// USER MENU
// ============================================================

const userItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: FiGrid,
  },
  {
    to: '/emergency',
    label: 'Emergency SOS',
    icon: FiAlertTriangle,
  },
  {
    to: '/location',
    label: 'Live Location',
    icon: FiMapPin,
  },
  {
    to: '/contacts',
    label: 'Trusted Contacts',
    icon: FiUsers,
  },
  {
    to: '/safety-zones',
    label: 'Safety Zones',
    icon: FiShield,
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: FiUser,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: FiSettings,
  },
]


// ============================================================
// GUARDIAN MENU
// ============================================================

const guardianItems = [
  {
    to: '/guardian/dashboard',
    label: 'Dashboard',
    icon: FiGrid,
  },
  {
    to: '/guardian/alerts',
    label: 'Alerts',
    icon: FiBell,
  },
  {
    to: '/guardian/emergency',
    label: 'Emergency',
    icon: FiAlertTriangle,
  },
  {
    to: '/guardian/location',
    label: 'Live Location',
    icon: FiMapPin,
  },
  {
    to: '/guardian/contacts',
    label: 'Trusted Contacts',
    icon: FiUsers,
  },
  {
    to: '/guardian/profile',
    label: 'Profile',
    icon: FiUser,
  },
  {
    to: '/guardian/settings',
    label: 'Settings',
    icon: FiSettings,
  },
]


// ============================================================
// ADMIN MENU
// ============================================================

const adminItems = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: FiGrid,
  },
  {
    to: '/admin/alerts',
    label: 'Alerts',
    icon: FiBell,
  },
  {
    to: '/admin/emergency',
    label: 'Emergency',
    icon: FiAlertTriangle,
  },
  {
    to: '/admin/location',
    label: 'Live Location',
    icon: FiMapPin,
  },
  {
    to: '/admin/safety-zones',
    label: 'Safety Zones',
    icon: FiShield,
  },
  {
    to: '/admin/trusted-contacts',
    label: 'Trusted Contacts',
    icon: FiUsers,
  },
  {
    to: '/admin/profile',
    label: 'Profile',
    icon: FiUser,
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    icon: FiSettings,
  },
]


export default function Sidebar({
  open,
  onClose,
}) {

  const navigate = useNavigate()

  const [profile, setProfile] =
    useState(null)

  const [loading, setLoading] =
    useState(true)


  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  useEffect(() => {

    const loadProfile = async () => {

      try {

        setLoading(true)

        const data =
          await getProfile()

        setProfile(data)

      } catch (error) {

        console.error(
          'Sidebar profile error:',
          error
        )

      } finally {

        setLoading(false)

      }

    }


    loadProfile()

  }, [])


  // ==========================================================
  // GET ROLE
  // ==========================================================

  const role = useMemo(() => {

    const profileRole =
      profile?.role

    if (
      profileRole
    ) {

      return String(
        profileRole
      ).toLowerCase()

    }


    const storedRole =
      localStorage.getItem(
        'userRole'
      )

    return storedRole
      ? String(
          storedRole
        ).toLowerCase()
      : 'user'

  }, [
    profile,
  ])


  // ==========================================================
  // GET MENU
  // ==========================================================

  const items = useMemo(() => {

    if (
      role === 'admin' ||
      role === 'administrator'
    ) {

      return adminItems

    }


    if (
      role === 'guardian'
    ) {

      return guardianItems

    }


    return userItems

  }, [
    role,
  ])


  // ==========================================================
  // ROLE LABEL
  // ==========================================================

  const roleLabel = useMemo(() => {

    if (
      role === 'admin' ||
      role === 'administrator'
    ) {

      return 'Administrator'

    }


    if (
      role === 'guardian'
    ) {

      return 'Guardian'

    }


    return 'User'

  }, [
    role,
  ])


  // ==========================================================
  // AVATAR
  // ==========================================================

  const avatar =
    profile?.email
      ? profile.email
          .charAt(0)
          .toUpperCase()
      : 'U'


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    logoutUser()

    localStorage.removeItem(
      'userProfile'
    )

    localStorage.removeItem(
      'userRole'
    )

    navigate(
      '/login',
      {
        replace: true,
      }
    )

  }


  return (

    <aside
      className={`swu-sidebar ${
        open ? 'open' : ''
      }`}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="d-flex align-items-center justify-content-between mb-4 px-2"
      >

        <div
          className="d-flex align-items-center gap-2"
        >

          <span
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background:
                'linear-gradient(135deg, var(--accent), var(--accent-2))',
            }}
          >

            <FiShield
              color="#08111a"
              size={16}
            />

          </span>


          <span
            className="font-display fw-bold"
          >
            SafeWithUs
          </span>

        </div>


        <button
          className="btn btn-sm d-lg-none btn-swu-ghost"
          onClick={onClose}
          type="button"
        >

          <FiX />

        </button>

      </div>


      {/* =====================================================
          PROFILE
      ===================================================== */}

      <div
        className="glass d-flex align-items-center gap-2 px-3 py-2 mb-4"
      >

        <div
          className="d-flex align-items-center justify-content-center font-mono flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius:
              '50%',
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-2))',
            color:
              '#08111a',
            fontWeight:
              700,
            fontSize:
              '0.8rem',
          }}
        >

          {avatar}

        </div>


        <div
          className="flex-grow-1"
          style={{
            minWidth: 0,
          }}
        >

          <div
            className="text-truncate"
            style={{
              fontSize:
                '0.85rem',
              fontWeight:
                600,
            }}
          >

            {loading
              ? 'Loading...'
              : profile?.username ||
                'User'}

          </div>


          <div
            className="d-flex align-items-center gap-1 text-muted-swu"
            style={{
              fontSize:
                '0.7rem',
            }}
          >

            <span
              className="status-dot on"
            />

            {roleLabel}

          </div>

        </div>

      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav
        className="flex-grow-1"
      >

        {items.map(
          ({
            to,
            label,
            icon: Icon,
          }) => (

            <NavLink
              key={to}
              to={to}
              className={({
                isActive,
              }) =>
                `swu-side-link ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
              onClick={
                onClose
              }
            >

              <Icon
                size={17}
              />

              {label}

            </NavLink>

          )
        )}

      </nav>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="pt-3"
        style={{
          borderTop:
            '1px solid var(--border-soft)',
        }}
      >

        <div
          className="d-flex align-items-center justify-content-between px-2 py-2"
        >

          <span
            className="text-muted-swu"
            style={{
              fontSize:
                '0.85rem',
            }}
          >
            Theme
          </span>


          <ThemeToggle />

        </div>


        <button
          className="swu-side-link w-100 border-0 bg-transparent text-start"
          onClick={
            handleLogout
          }
          type="button"
        >

          <FiLogOut
            size={17}
          />

          Logout

        </button>

      </div>

    </aside>

  )
}