import React, { useEffect, useState } from 'react'
import {
  FiMail,
  FiPhone,
  FiAtSign,
  FiCalendar,
  FiShield,
  FiEdit2,
  FiUsers,
  FiAlertTriangle,
  FiMapPin,
} from 'react-icons/fi'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { getProfile } from '../../services/authService'


export default function AdminProfile() {

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {

    const loadProfile = async () => {

      try {

        const data = await getProfile()

        setProfile(data)

      } catch (error) {

        console.error(
          'Admin profile error:',
          error
        )

        setError(
          'Unable to load admin profile'
        )

      } finally {

        setLoading(false)

      }

    }

    loadProfile()

  }, [])


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <DashboardLayout>

        <div className="text-center py-5">
          Loading admin profile...
        </div>

      </DashboardLayout>
    )

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error || !profile) {

    return (
      <DashboardLayout>

        <div
          className="text-center py-5 text-danger-swu"
        >
          {error || 'Admin profile not found'}
        </div>

      </DashboardLayout>
    )

  }


  // =====================================================
  // AVATAR
  // =====================================================

  const avatar = profile.email
    ? profile.email
        .charAt(0)
        .toUpperCase()
    : 'A'


  // =====================================================
  // ROLE
  // =====================================================

  const role =
    profile.role ||
    'Admin'


  return (

    <DashboardLayout
      title="Admin Profile"
      subtitle="Administrator identity and system access information."
    >

      <div className="row g-4">


        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="col-lg-4">

          <div
            className="glass glass-card text-center"
          >

            {/* Avatar */}

            <div
              className="d-flex align-items-center justify-content-center font-mono mx-auto mb-3"
              style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: '#08111a',
                fontWeight: 700,
                fontSize: '1.8rem',
              }}
            >
              {avatar}
            </div>


            {/* Email */}

            <h5 className="fw-bold mb-1">
              {profile.email}
            </h5>


            {/* Username */}

            <div className="text-muted-swu mb-3">
              {profile.username ||
                'Administrator'}
            </div>


            {/* Status */}

            <div className="d-flex align-items-center justify-content-center gap-2 mb-4">

              <span className="status-dot on" />

              <span
                className="text-accent"
                style={{
                  fontSize: '0.85rem',
                }}
              >
                Administrator Access
              </span>

            </div>


            {/* Edit */}

            <button
              className="btn btn-swu-primary w-100 d-flex align-items-center justify-content-center gap-2"
              type="button"
            >
              <FiEdit2 size={14} />

              Edit Profile

            </button>

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="col-lg-8">


          {/* =================================================
              ACCOUNT DETAILS
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-3">
              Account Details
            </h6>


            <div className="row g-4">


              {/* Email */}

              <div className="col-md-6">

                <div
                  className="d-flex align-items-center gap-2 text-muted-swu mb-1"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >

                  <FiMail size={13} />

                  Email

                </div>


                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.9rem',
                  }}
                >
                  {profile.email}
                </div>

              </div>


              {/* Username */}

              <div className="col-md-6">

                <div
                  className="d-flex align-items-center gap-2 text-muted-swu mb-1"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >

                  <FiAtSign size={13} />

                  Username

                </div>


                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.9rem',
                  }}
                >
                  {profile.username ||
                    'Not provided'}
                </div>

              </div>


              {/* Phone */}

              <div className="col-md-6">

                <div
                  className="d-flex align-items-center gap-2 text-muted-swu mb-1"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >

                  <FiPhone size={13} />

                  Phone

                </div>


                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.9rem',
                  }}
                >
                  {profile.phone ||
                    'Not provided'}
                </div>

              </div>


              {/* Account Type */}

              <div className="col-md-6">

                <div
                  className="d-flex align-items-center gap-2 text-muted-swu mb-1"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >

                  <FiShield size={13} />

                  Account Type

                </div>


                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.9rem',
                  }}
                >
                  {role}
                </div>

              </div>


              {/* Created Date */}

              <div className="col-md-6">

                <div
                  className="d-flex align-items-center gap-2 text-muted-swu mb-1"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >

                  <FiCalendar size={13} />

                  Account Created

                </div>


                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.9rem',
                  }}
                >
                  {profile.date_joined
                    ? new Date(
                        profile.date_joined
                      ).toLocaleDateString()
                    : 'Not available'}
                </div>

              </div>


              {/* Admin Status */}

              <div className="col-md-6">

                <div
                  className="d-flex align-items-center gap-2 text-muted-swu mb-1"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >

                  <FiShield size={13} />

                  Account Status

                </div>


                <div
                  className="d-flex align-items-center gap-2"
                  style={{
                    fontSize: '0.9rem',
                  }}
                >

                  <span className="status-dot on" />

                  Active

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              ADMIN OVERVIEW
          ================================================= */}

          <div className="glass glass-card">

            <h6 className="mb-3 d-flex align-items-center gap-2">

              <FiShield className="text-accent" />

              Admin Overview

            </h6>


            <div className="row g-3 text-center">


              {/* Users */}

              <div className="col-4">

                <div
                  className="d-flex align-items-center justify-content-center mx-auto mb-2"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background:
                      'var(--surface-strong)',
                  }}
                >
                  <FiUsers
                    className="text-accent"
                    size={18}
                  />
                </div>


                <div
                  className="font-mono text-accent fw-bold"
                  style={{
                    fontSize: '1rem',
                  }}
                >
                  Users
                </div>


                <div
                  className="text-muted-swu"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >
                  Manage users
                </div>

              </div>


              {/* Locations */}

              <div className="col-4">

                <div
                  className="d-flex align-items-center justify-content-center mx-auto mb-2"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background:
                      'var(--surface-strong)',
                  }}
                >
                  <FiMapPin
                    className="text-accent"
                    size={18}
                  />
                </div>


                <div
                  className="font-mono text-accent fw-bold"
                  style={{
                    fontSize: '1rem',
                  }}
                >
                  Location
                </div>


                <div
                  className="text-muted-swu"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >
                  Monitor locations
                </div>

              </div>


              {/* Emergency */}

              <div className="col-4">

                <div
                  className="d-flex align-items-center justify-content-center mx-auto mb-2"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background:
                      'var(--surface-strong)',
                  }}
                >
                  <FiAlertTriangle
                    className="text-accent"
                    size={18}
                  />
                </div>


                <div
                  className="font-mono text-accent fw-bold"
                  style={{
                    fontSize: '1rem',
                  }}
                >
                  Emergency
                </div>


                <div
                  className="text-muted-swu"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >
                  Monitor emergencies
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  )
}