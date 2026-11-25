import React, { useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiMapPin,
  FiUser,
  FiClock,
  FiRefreshCw,
  FiShield,
  FiPhoneCall,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import {
  getProtectedUsers,
  getProtectedUserEmergencies,
} from '../../services/guardianService.js'


export default function GuardianEmergency() {
  const [users, setUsers] = useState([])
  const [emergencies, setEmergencies] = useState([])

  const [selectedUserId, setSelectedUserId] = useState('all')

  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingEmergencies, setLoadingEmergencies] = useState(false)

  const [error, setError] = useState('')


  // ==========================================================
  // LOAD PROTECTED USERS
  // ==========================================================

  const loadProtectedUsers = async () => {
    try {
      setLoadingUsers(true)
      setError('')

      const data = await getProtectedUsers()

      const protectedUsers = Array.isArray(data)
        ? data
        : data?.results || []

      setUsers(protectedUsers)
    } catch (err) {
      console.error(
        'Failed to load protected users:',
        err
      )

      setError(
        err.response?.data?.detail ||
        'Unable to load protected users.'
      )
    } finally {
      setLoadingUsers(false)
    }
  }


  // ==========================================================
  // LOAD EMERGENCIES
  // ==========================================================

  const loadEmergencies = async (userId = selectedUserId) => {
    try {
      setLoadingEmergencies(true)
      setError('')

      // -------------------------------------------------------
      // ALL PROTECTED USERS
      // -------------------------------------------------------

      if (userId === 'all') {
        const allEmergencies = []

        for (const protectedUser of users) {
          const protectedUserId =
            protectedUser.user ||
            protectedUser.id

          const protectedUserName =
            protectedUser.user_name ||
            protectedUser.username ||
            protectedUser.name ||
            `User ${protectedUserId}`

          try {
            const data =
              await getProtectedUserEmergencies(
                protectedUserId
              )

            const userEmergencies =
              Array.isArray(data)
                ? data
                : data?.results || []

            userEmergencies.forEach(
              (emergency) => {
                allEmergencies.push({
                  ...emergency,
                  protected_user_id:
                    protectedUserId,
                  protected_user_name:
                    protectedUserName,
                })
              }
            )
          } catch (err) {
            console.error(
              `Emergency load failed for user ${protectedUserId}:`,
              err
            )
          }
        }

        setEmergencies(allEmergencies)
        return
      }


      // -------------------------------------------------------
      // ONE PROTECTED USER
      // -------------------------------------------------------

      const data =
        await getProtectedUserEmergencies(
          userId
        )

      const userEmergencies =
        Array.isArray(data)
          ? data
          : data?.results || []

      const selectedUser =
        users.find(
          (user) =>
            String(
              user.user ||
              user.id
            ) === String(userId)
        )

      const userName =
        selectedUser?.user_name ||
        selectedUser?.username ||
        selectedUser?.name ||
        `User ${userId}`

      setEmergencies(
        userEmergencies.map(
          (emergency) => ({
            ...emergency,
            protected_user_id:
              userId,
            protected_user_name:
              userName,
          })
        )
      )
    } catch (err) {
      console.error(
        'Failed to load guardian emergencies:',
        err
      )

      setError(
        err.response?.data?.detail ||
        'Unable to load emergency records.'
      )
    } finally {
      setLoadingEmergencies(false)
    }
  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadProtectedUsers()
  }, [])


  // ==========================================================
  // LOAD EMERGENCIES AFTER USERS LOAD
  // ==========================================================

  useEffect(() => {
    if (users.length > 0) {
      loadEmergencies('all')
    } else if (!loadingUsers) {
      setEmergencies([])
    }
  }, [users, loadingUsers])


  // ==========================================================
  // COUNTS
  // ==========================================================

  const activeEmergencies = useMemo(() => {
    return emergencies.filter(
      (emergency) =>
        emergency.status === 'active'
    )
  }, [emergencies])


  const resolvedEmergencies = useMemo(() => {
    return emergencies.filter(
      (emergency) =>
        emergency.status === 'resolved'
    )
  }, [emergencies])


  const cancelledEmergencies = useMemo(() => {
    return emergencies.filter(
      (emergency) =>
        emergency.status === 'cancelled'
    )
  }, [emergencies])


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (value) => {
    if (!value) {
      return 'Unknown'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return 'Unknown'
    }

    return date.toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }


  // ==========================================================
  // EMERGENCY TYPE
  // ==========================================================

  const getEmergencyLabel = (type) => {
    const types = {
      sos: 'SOS',
      medical: 'Medical',
      fire: 'Fire',
      accident: 'Accident',
      police: 'Police',
      other: 'Other',
    }

    return types[type] || type || 'Emergency'
  }


  // ==========================================================
  // STATUS STYLE
  // ==========================================================

  const getStatusStyle = (status) => {
    if (status === 'active') {
      return {
        background:
          'rgba(255, 77, 94, 0.12)',
        color: '#ff5c6c',
        border:
          '1px solid rgba(255, 77, 94, 0.30)',
      }
    }

    if (status === 'resolved') {
      return {
        background:
          'rgba(38, 224, 201, 0.10)',
        color: '#26e0c9',
        border:
          '1px solid rgba(38, 224, 201, 0.25)',
      }
    }

    return {
      background:
        'rgba(120, 130, 150, 0.10)',
      color: '#aeb8c8',
      border:
        '1px solid rgba(120, 130, 150, 0.20)',
    }
  }


  return (
    <DashboardLayout
      title="Emergency Monitoring"
      subtitle="Monitor emergency events from your protected users."
    >

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="glass glass-card mb-4"
          style={{
            border:
              '1px solid rgba(255,77,94,0.35)',
          }}
        >
          <div
            className="text-danger-swu"
            style={{
              fontSize: '0.84rem',
            }}
          >
            {error}
          </div>
        </div>
      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="row g-4 mb-4">

        <div className="col-md-3">
          <div className="glass glass-card h-100">
            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.76rem',
              }}
            >
              Protected Users
            </div>

            <div
              className="font-mono fw-bold"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {users.length}
            </div>
          </div>
        </div>


        <div className="col-md-3">
          <div className="glass glass-card h-100">
            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.76rem',
              }}
            >
              Active SOS
            </div>

            <div
              className="font-mono fw-bold text-danger-swu"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {activeEmergencies.length}
            </div>
          </div>
        </div>


        <div className="col-md-3">
          <div className="glass glass-card h-100">
            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.76rem',
              }}
            >
              Resolved
            </div>

            <div
              className="font-mono fw-bold text-accent"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {resolvedEmergencies.length}
            </div>
          </div>
        </div>


        <div className="col-md-3">
          <div className="glass glass-card h-100">
            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.76rem',
              }}
            >
              Cancelled
            </div>

            <div
              className="font-mono fw-bold"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {cancelledEmergencies.length}
            </div>
          </div>
        </div>

      </div>


      {/* =====================================================
          USER SELECTOR + REFRESH
      ===================================================== */}

      <div className="glass glass-card mb-4">

        <div
          className="d-flex flex-wrap align-items-center justify-content-between gap-3"
        >

          <div>
            <h6 className="mb-1 d-flex align-items-center gap-2">

              <FiShield className="text-accent" />

              Protected User Emergencies

            </h6>

            <div
              className="text-muted-swu"
              style={{
                fontSize: '0.74rem',
              }}
            >
              View emergency events from your protected users.
            </div>
          </div>


          <div
            className="d-flex align-items-center gap-2"
          >

            <select
              className="form-select form-control-swu"
              value={selectedUserId}
              onChange={(e) => {
                const value = e.target.value

                setSelectedUserId(value)
                loadEmergencies(value)
              }}
              disabled={
                loadingUsers ||
                users.length === 0
              }
              style={{
                minWidth: 220,
              }}
            >
              <option value="all">
                All Protected Users
              </option>

              {users.map((user) => {

                const userId =
                  user.user ||
                  user.id

                const userName =
                  user.user_name ||
                  user.username ||
                  user.name ||
                  `User ${userId}`

                return (
                  <option
                    key={userId}
                    value={userId}
                  >
                    {userName}
                  </option>
                )
              })}
            </select>


            <button
              type="button"
              className="btn btn-swu-ghost d-flex align-items-center gap-2"
              onClick={() =>
                loadEmergencies(
                  selectedUserId
                )
              }
              disabled={
                loadingEmergencies ||
                users.length === 0
              }
            >
              <FiRefreshCw size={15} />

              Refresh
            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {(loadingUsers ||
        loadingEmergencies) && (

        <div
          className="glass glass-card text-center py-5 mb-4"
        >
          <div
            className="spinner-border"
            role="status"
            style={{
              color:
                'var(--accent)',
            }}
          />

          <div
            className="text-muted-swu mt-3"
            style={{
              fontSize: '0.84rem',
            }}
          >
            Loading emergency records...
          </div>
        </div>
      )}


      {/* =====================================================
          NO PROTECTED USERS
      ===================================================== */}

      {!loadingUsers &&
        users.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >
          <FiUsers
            size={44}
            className="text-accent mb-3"
          />

          <h6 className="fw-bold">
            No Protected Users
          </h6>

          <p
            className="text-muted-swu mb-0"
            style={{
              fontSize: '0.82rem',
            }}
          >
            You don't have any protected users yet.
          </p>
        </div>
      )}


      {/* =====================================================
          NO EMERGENCIES
      ===================================================== */}

      {!loadingUsers &&
        !loadingEmergencies &&
        users.length > 0 &&
        emergencies.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >
          <FiShield
            size={44}
            className="text-accent mb-3"
          />

          <h6 className="fw-bold">
            No Emergency Records
          </h6>

          <p
            className="text-muted-swu mb-0"
            style={{
              fontSize: '0.82rem',
            }}
          >
            Your protected users have no emergency records.
          </p>
        </div>
      )}


      {/* =====================================================
          EMERGENCY RECORDS
      ===================================================== */}

      {!loadingUsers &&
        !loadingEmergencies &&
        emergencies.length > 0 && (

        <div
          className="d-flex flex-column gap-3"
        >

          {emergencies.map((emergency) => {

            const statusStyle =
              getStatusStyle(
                emergency.status
              )

            return (
              <div
                key={emergency.id}
                className="glass glass-card"
              >

                <div className="row g-4">

                  {/* =========================================
                      EMERGENCY INFORMATION
                  ========================================= */}

                  <div className="col-lg-8">

                    <div
                      className="d-flex align-items-center justify-content-between mb-3"
                    >

                      <div
                        className="d-flex align-items-center gap-3"
                      >

                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 13,
                            background:
                              emergency.status === 'active'
                                ? 'rgba(255,77,94,0.10)'
                                : 'var(--surface-strong)',
                          }}
                        >

                          <FiAlertTriangle
                            className={
                              emergency.status === 'active'
                                ? 'text-danger-swu'
                                : 'text-accent'
                            }
                            size={21}
                          />

                        </div>


                        <div>

                          <h6 className="fw-bold mb-1">
                            {getEmergencyLabel(
                              emergency.emergency_type
                            )}
                          </h6>

                          <div
                            className="text-muted-swu"
                            style={{
                              fontSize:
                                '0.72rem',
                            }}
                          >
                            Emergency #{emergency.id}
                          </div>

                        </div>

                      </div>


                      <span
                        className="px-3 py-1"
                        style={{
                          ...statusStyle,
                          borderRadius: 999,
                          fontSize:
                            '0.71rem',
                          fontWeight: 600,
                          textTransform:
                            'capitalize',
                        }}
                      >
                        {emergency.status ||
                          'Unknown'}
                      </span>

                    </div>


                    {/* USER */}

                    <div
                      className="d-flex align-items-center gap-2 mb-3"
                      style={{
                        fontSize:
                          '0.84rem',
                      }}
                    >

                      <FiUser
                        className="text-accent"
                        size={14}
                      />

                      <span className="text-muted-swu">
                        User:
                      </span>

                      <span className="fw-semibold">
                        {emergency.protected_user_name}
                      </span>

                    </div>


                    {/* MESSAGE */}

                    <div
                      className="mb-3"
                      style={{
                        fontSize:
                          '0.88rem',
                      }}
                    >
                      {emergency.message ||
                        'No emergency message provided.'}
                    </div>


                    {/* CREATED */}

                    <div
                      className="d-flex align-items-center gap-2 text-muted-swu mb-2"
                      style={{
                        fontSize:
                          '0.75rem',
                      }}
                    >

                      <FiClock
                        size={13}
                      />

                      Created:{' '}

                      {formatDate(
                        emergency.created_at
                      )}

                    </div>


                    {/* RESOLVED */}

                    {emergency.resolved_at && (
                      <div
                        className="d-flex align-items-center gap-2 text-muted-swu"
                        style={{
                          fontSize:
                            '0.75rem',
                        }}
                      >

                        <FiClock
                          size={13}
                        />

                        Resolved:{' '}

                        {formatDate(
                          emergency.resolved_at
                        )}

                      </div>
                    )}

                  </div>


                  {/* =========================================
                      LOCATION
                  ========================================= */}

                  <div className="col-lg-4">

                    <div className="glass p-3 h-100">

                      <div
                        className="d-flex align-items-center gap-2 mb-3"
                      >

                        <FiMapPin
                          className="text-accent"
                        />

                        <span className="fw-semibold">
                          Emergency Location
                        </span>

                      </div>


                      <div
                        className="font-mono"
                        style={{
                          fontSize:
                            '0.78rem',
                        }}
                      >

                        <div className="mb-3">

                          <div className="text-muted-swu">
                            Latitude
                          </div>

                          <div>
                            {emergency.latitude ??
                              'Unavailable'}
                          </div>

                        </div>


                        <div className="mb-3">

                          <div className="text-muted-swu">
                            Longitude
                          </div>

                          <div>
                            {emergency.longitude ??
                              'Unavailable'}
                          </div>

                        </div>


                        <div>

                          <div className="text-muted-swu">
                            Status
                          </div>

                          <div>
                            {emergency.status ||
                              'Unknown'}
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )
          })}

        </div>
      )}


      {/* =====================================================
          EMERGENCY SERVICES
      ===================================================== */}

      <div className="glass glass-card mt-4">

        <h6 className="mb-3 d-flex align-items-center gap-2">

          <FiPhoneCall className="text-accent" />

          Emergency Services

        </h6>


        <div
          className="row g-2 font-mono"
          style={{
            fontSize: '0.82rem',
          }}
        >

          <div className="col-6 col-md-3">
            <a
              href="tel:100"
              className="btn btn-swu-ghost w-100"
            >
              Police — 100
            </a>
          </div>

          <div className="col-6 col-md-3">
            <a
              href="tel:101"
              className="btn btn-swu-ghost w-100"
            >
              Fire — 101
            </a>
          </div>

          <div className="col-6 col-md-3">
            <a
              href="tel:102"
              className="btn btn-swu-ghost w-100"
            >
              Ambulance — 102
            </a>
          </div>

          <div className="col-6 col-md-3">
            <a
              href="tel:1091"
              className="btn btn-swu-ghost w-100"
            >
              Women's Helpline
            </a>
          </div>

        </div>
      </div>

    </DashboardLayout>
  )
}