import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  FiUsers,
  FiShield,
  FiAlertTriangle,
  FiMapPin,
  FiBell,
  FiActivity,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi'

import { Link } from 'react-router-dom'

import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import {
  getAdminDashboard,
  getAdminAlerts,
} from '../../services/adminService.js'


export default function AdminDashboard() {

  // ============================================================
  // STATE
  // ============================================================

  const [dashboard, setDashboard] = useState(null)

  const [alerts, setAlerts] = useState([])

  const [loading, setLoading] = useState(true)


  // ============================================================
  // LOAD ADMIN DASHBOARD
  // ============================================================

  const loadDashboard = async () => {

    try {

      setLoading(true)

      // --------------------------------------------------------
      // GET DASHBOARD STATISTICS
      // --------------------------------------------------------

      const dashboardData =
        await getAdminDashboard()

      setDashboard(
        dashboardData || {}
      )


      // --------------------------------------------------------
      // GET ALL ALERTS
      // --------------------------------------------------------

      const alertData =
        await getAdminAlerts()

      const normalizedAlerts =
        Array.isArray(alertData)
          ? alertData
          : alertData?.results || []

      setAlerts(
        normalizedAlerts
      )


    } catch (error) {

      console.error(
        'Admin dashboard error:',
        error
      )

      Swal.fire({

        title:
          'Dashboard Error',

        text:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Unable to load admin dashboard data.',

        icon:
          'error',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',

      })

    } finally {

      setLoading(false)

    }
  }


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadDashboard()

  }, [])


  // ============================================================
  // ACTIVE ALERTS
  // ============================================================

  const activeAlerts = useMemo(() => {

    return alerts.filter(
      (alert) =>
        alert.status === 'active' ||
        alert.is_active === true
    )

  }, [alerts])


  // ============================================================
  // EMERGENCY ALERTS
  // ============================================================

  const emergencyAlerts = useMemo(() => {

    return alerts.filter((alert) => {

      const text =
        String(
          alert.message || ''
        ).toLowerCase()

      return (
        alert.category === 'Emergency' ||
        text.includes('emergency') ||
        text.includes('sos')
      )

    })

  }, [alerts])


  // ============================================================
  // RECENT ALERTS
  // ============================================================

  const recentAlerts = useMemo(() => {

    return [...alerts]

      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      )

      .slice(0, 5)

  }, [alerts])


  // ============================================================
  // GREETING
  // ============================================================

  const hour =
    new Date().getHours()

  let greeting =
    'Good Night'

  if (
    hour >= 5 &&
    hour < 12
  ) {

    greeting =
      'Good Morning'

  } else if (
    hour >= 12 &&
    hour < 17
  ) {

    greeting =
      'Good Afternoon'

  } else if (
    hour >= 17 &&
    hour < 21
  ) {

    greeting =
      'Good Evening'

  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading && !dashboard) {

    return (

      <DashboardLayout
        title={`${greeting}, Admin 👋`}
        subtitle="Monitor and manage the SafeWithUs safety network."
      >

        <div className="text-center py-5">

          <FiRefreshCw
            size={30}
            className="spin"
          />

          <div className="text-muted-swu mt-3">

            Loading admin dashboard...

          </div>

        </div>

      </DashboardLayout>

    )

  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (

    <DashboardLayout
      title={`${greeting}, Admin 👋`}
      subtitle="Monitor and manage the SafeWithUs safety network."
    >

      {/* ====================================================== */}
      {/* REFRESH */}
      {/* ====================================================== */}

      <div className="d-flex justify-content-end mb-3">

        <button
          type="button"
          className="btn btn-swu-ghost d-flex align-items-center gap-2"
          onClick={loadDashboard}
          disabled={loading}
        >

          <FiRefreshCw
            size={14}
          />

          {loading
            ? 'Refreshing...'
            : 'Refresh Dashboard'}

        </button>

      </div>


      {/* ====================================================== */}
      {/* STAT CARDS */}
      {/* ====================================================== */}

      <div className="row g-4 mb-4">


        {/* ================================================== */}
        {/* USERS */}
        {/* ================================================== */}

        <div className="col-xl-3 col-md-6">

          <div className="glass glass-card h-100">

            <div className="d-flex align-items-center justify-content-between">

              <div>

                <div
                  className="text-muted-swu mb-2"
                  style={{
                    fontSize: '0.8rem',
                  }}
                >

                  Total Users

                </div>

                <div
                  className="font-mono fw-bold"
                  style={{
                    fontSize: '1.8rem',
                  }}
                >

                  {dashboard?.total_users ?? 0}

                </div>

                <div
                  className="text-faint-swu mt-1"
                  style={{
                    fontSize: '0.72rem',
                  }}
                >

                  Registered users

                </div>

              </div>


              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background:
                    'var(--surface-strong)',
                }}
              >

                <FiUsers
                  className="text-accent"
                  size={21}
                />

              </div>

            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* GUARDIANS */}
        {/* ================================================== */}

        <div className="col-xl-3 col-md-6">

          <div className="glass glass-card h-100">

            <div className="d-flex align-items-center justify-content-between">

              <div>

                <div
                  className="text-muted-swu mb-2"
                  style={{
                    fontSize: '0.8rem',
                  }}
                >

                  Total Guardians

                </div>

                <div
                  className="font-mono fw-bold"
                  style={{
                    fontSize: '1.8rem',
                  }}
                >

                  {dashboard?.total_guardians ?? 0}

                </div>

                <div
                  className="text-faint-swu mt-1"
                  style={{
                    fontSize: '0.72rem',
                  }}
                >

                  Guardian network

                </div>

              </div>


              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background:
                    'var(--surface-strong)',
                }}
              >

                <FiShield
                  className="text-accent"
                  size={21}
                />

              </div>

            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* ACTIVE EMERGENCIES */}
        {/* ================================================== */}

        <div className="col-xl-3 col-md-6">

          <div className="glass glass-card h-100">

            <div className="d-flex align-items-center justify-content-between">

              <div>

                <div
                  className="text-muted-swu mb-2"
                  style={{
                    fontSize: '0.8rem',
                  }}
                >

                  Active Emergencies

                </div>

                <div
                  className="font-mono fw-bold text-danger-swu"
                  style={{
                    fontSize: '1.8rem',
                  }}
                >

                  {dashboard?.active_emergencies ?? 0}

                </div>

                <div
                  className="text-faint-swu mt-1"
                  style={{
                    fontSize: '0.72rem',
                  }}
                >

                  Require attention

                </div>

              </div>


              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background:
                    'var(--surface-strong)',
                }}
              >

                <FiAlertTriangle
                  className="text-danger-swu"
                  size={21}
                />

              </div>

            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* ALERTS */}
        {/* ================================================== */}

        <div className="col-xl-3 col-md-6">

          <div className="glass glass-card h-100">

            <div className="d-flex align-items-center justify-content-between">

              <div>

                <div
                  className="text-muted-swu mb-2"
                  style={{
                    fontSize: '0.8rem',
                  }}
                >

                  Total Alerts

                </div>

                <div
                  className="font-mono fw-bold"
                  style={{
                    fontSize: '1.8rem',
                  }}
                >

                  {dashboard?.total_alerts ?? alerts.length}

                </div>

                <div
                  className="text-faint-swu mt-1"
                  style={{
                    fontSize: '0.72rem',
                  }}
                >

                  Safety events

                </div>

              </div>


              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background:
                    'var(--surface-strong)',
                }}
              >

                <FiBell
                  className="text-accent"
                  size={21}
                />

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================== */}
      {/* SECONDARY STATISTICS */}
      {/* ====================================================== */}

      <div className="row g-4 mb-4">


        {/* TOTAL EMERGENCIES */}

        <div className="col-md-4">

          <div className="glass glass-card">

            <div className="d-flex align-items-center">

              <FiActivity
                className="text-danger-swu me-3"
                size={25}
              />

              <div>

                <div className="text-muted-swu">
                  Total Emergencies
                </div>

                <h4 className="fw-bold mb-0">

                  {dashboard?.total_emergencies ?? 0}

                </h4>

              </div>

            </div>

          </div>

        </div>


        {/* RESOLVED */}

        <div className="col-md-4">

          <div className="glass glass-card">

            <div className="d-flex align-items-center">

              <FiActivity
                className="text-accent me-3"
                size={25}
              />

              <div>

                <div className="text-muted-swu">
                  Resolved Emergencies
                </div>

                <h4 className="fw-bold mb-0">

                  {dashboard?.resolved_emergencies ?? 0}

                </h4>

              </div>

            </div>

          </div>

        </div>


        {/* CANCELLED */}

        <div className="col-md-4">

          <div className="glass glass-card">

            <div className="d-flex align-items-center">

              <FiActivity
                className="text-muted-swu me-3"
                size={25}
              />

              <div>

                <div className="text-muted-swu">
                  Cancelled Emergencies
                </div>

                <h4 className="fw-bold mb-0">

                  {dashboard?.cancelled_emergencies ?? 0}

                </h4>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================== */}
      {/* SYSTEM MONITORING */}
      {/* ====================================================== */}

      <div className="row g-4 mb-4">


        <div className="col-lg-8">

          <div className="glass glass-card h-100">

            <div className="d-flex align-items-center justify-content-between mb-4">

              <div>

                <h6 className="mb-1 d-flex align-items-center gap-2">

                  <FiActivity
                    className="text-accent"
                  />

                  System Monitoring

                </h6>

                <div
                  className="text-muted-swu"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >

                  Overview of current SafeWithUs activity

                </div>

              </div>


              <span className="eyebrow">

                ADMIN

              </span>

            </div>


            <div className="row g-3">


              {/* LIVE TRACKING */}

              <div className="col-md-4">

                <Link
                  to="/admin/live-location"
                  className="text-decoration-none"
                >

                  <div
                    className="glass p-3 h-100"
                    style={{
                      minHeight: 110,
                      cursor: 'pointer',
                    }}
                  >

                    <FiMapPin
                      className="text-accent mb-3"
                      size={20}
                    />

                    <div
                      className="text-muted-swu"
                      style={{
                        fontSize: '0.75rem',
                      }}
                    >

                      Live Tracking

                    </div>

                    <div className="fw-bold mt-1">

                      Monitoring

                    </div>

                  </div>

                </Link>

              </div>


              {/* GUARDIANS */}

              <div className="col-md-4">

                <Link
                  to="/admin/guardians"
                  className="text-decoration-none"
                >

                  <div
                    className="glass p-3 h-100"
                    style={{
                      minHeight: 110,
                      cursor: 'pointer',
                    }}
                  >

                    <FiShield
                      className="text-accent mb-3"
                      size={20}
                    />

                    <div
                      className="text-muted-swu"
                      style={{
                        fontSize: '0.75rem',
                      }}
                    >

                      Guardian Network

                    </div>

                    <div className="fw-bold mt-1">

                      {dashboard?.total_guardians ?? 0}

                    </div>

                  </div>

                </Link>

              </div>


              {/* ALERT SYSTEM */}

              <div className="col-md-4">

                <Link
                  to="/admin/alerts"
                  className="text-decoration-none"
                >

                  <div
                    className="glass p-3 h-100"
                    style={{
                      minHeight: 110,
                      cursor: 'pointer',
                    }}
                  >

                    <FiBell
                      className="text-accent mb-3"
                      size={20}
                    />

                    <div
                      className="text-muted-swu"
                      style={{
                        fontSize: '0.75rem',
                      }}
                    >

                      Alert System

                    </div>

                    <div className="fw-bold mt-1">

                      {alerts.length} Events

                    </div>

                  </div>

                </Link>

              </div>


            </div>

          </div>

        </div>


        {/* ================================================== */}
        {/* ADMIN CONTROLS */}
        {/* ================================================== */}

        <div className="col-lg-4">

          <div className="glass glass-card h-100">

            <h6 className="mb-3">

              Admin Controls

            </h6>


            <Link
              to="/admin/alerts"
              className="btn btn-swu-ghost w-100 text-start mb-2 d-flex align-items-center justify-content-between"
            >

              <span className="d-flex align-items-center gap-2">

                <FiBell
                  size={15}
                />

                View All Alerts

              </span>

              <FiChevronRight
                size={14}
              />

            </Link>


            <Link
              to="/admin/users"
              className="btn btn-swu-ghost w-100 text-start mb-2 d-flex align-items-center justify-content-between"
            >

              <span className="d-flex align-items-center gap-2">

                <FiUsers
                  size={15}
                />

                Manage Users

              </span>

              <FiChevronRight
                size={14}
              />

            </Link>


            <Link
              to="/admin/guardians"
              className="btn btn-swu-ghost w-100 text-start mb-2 d-flex align-items-center justify-content-between"
            >

              <span className="d-flex align-items-center gap-2">

                <FiShield
                  size={15}
                />

                Manage Guardians

              </span>

              <FiChevronRight
                size={14}
              />

            </Link>


            <Link
              to="/admin/emergencies"
              className="btn btn-swu-ghost w-100 text-start d-flex align-items-center justify-content-between"
            >

              <span className="d-flex align-items-center gap-2">

                <FiAlertTriangle
                  size={15}
                />

                Emergency Center

              </span>

              <FiChevronRight
                size={14}
              />

            </Link>

          </div>

        </div>

      </div>


      {/* ====================================================== */}
      {/* RECENT ALERTS */}
      {/* ====================================================== */}

      <div className="row g-4">

        <div className="col-12">

          <div className="glass glass-card">

            <div className="d-flex align-items-center justify-content-between mb-3">

              <h6 className="mb-0 d-flex align-items-center gap-2">

                <FiBell
                  className="text-accent"
                />

                Recent System Alerts

              </h6>


              <Link
                to="/admin/alerts"
                className="text-accent d-flex align-items-center gap-1"
                style={{
                  fontSize: '0.78rem',
                }}
              >

                View All

                <FiChevronRight
                  size={12}
                />

              </Link>

            </div>


            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading ? (

              <div
                className="text-center py-4 text-muted-swu"
              >

                Loading alerts...

              </div>


            ) : recentAlerts.length === 0 ? (

              <div
                className="text-center py-4 text-muted-swu"
              >

                <FiBell
                  size={25}
                  className="mb-2"
                />

                <div>

                  No alerts available

                </div>

              </div>


            ) : (

              <div>

                {recentAlerts.map(
                  (alert) => (

                    <div
                      key={alert.id}
                      className="d-flex align-items-center justify-content-between py-3"
                      style={{
                        borderBottom:
                          '1px solid var(--border-soft)',
                      }}
                    >

                      <div
                        className="d-flex align-items-center gap-3"
                      >

                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            background:
                              'var(--surface-strong)',
                          }}
                        >

                          <FiAlertTriangle
                            className="text-accent"
                            size={17}
                          />

                        </div>


                        <div>

                          <div
                            style={{
                              fontSize:
                                '0.86rem',
                            }}
                          >

                            {alert.message ||
                              'Safety alert'}

                          </div>


                          <div
                            className="text-faint-swu"
                            style={{
                              fontSize:
                                '0.7rem',
                            }}
                          >

                            User:{' '}

                            {alert.username ||
                              alert.user ||
                              'Unknown'}

                            {' · '}

                            {alert.created_at
                              ? new Date(
                                  alert.created_at
                                ).toLocaleString()
                              : 'Unknown time'}

                          </div>

                        </div>

                      </div>


                      <span
                        className={
                          alert.status === 'active'
                            ? 'status-dot danger'
                            : 'status-dot on'
                        }
                      />

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </DashboardLayout>

  )
}