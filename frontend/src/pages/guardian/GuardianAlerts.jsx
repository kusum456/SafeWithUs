import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  FiSearch,
  FiRefreshCw,
  FiAlertTriangle,
  FiMapPin,
  FiUser,
  FiShield,
  FiClock,
} from 'react-icons/fi'
import Swal from 'sweetalert2'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import {
  getProtectedUsers,
  getProtectedUserAlerts,
} from '../../services/guardianService.js'
export default function GuardianAlerts() {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] =
    useState('all')
  const [alerts, setAlerts] = useState([])
  const [query, setQuery] = useState('')
  const [loadingUsers, setLoadingUsers] =
    useState(true)
  const [loadingAlerts, setLoadingAlerts] =
    useState(false)
  // ==========================================================
  // LOAD PROTECTED USERS
  // ==========================================================
  const loadProtectedUsers = async () => {
    try {
      setLoadingUsers(true)
      const data =
        await getProtectedUsers()
      const protectedUsers =
        Array.isArray(data)
          ? data
          : data?.results || []
      setUsers(protectedUsers)
    } catch (error) {
      console.error(
        'Failed to load protected users:',
        error
      )
      Swal.fire({
        title: 'Unable to Load Users',
        text:
          error.response?.data?.detail ||
          'Unable to load your protected users.',
        icon: 'error',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })
    } finally {
      setLoadingUsers(false)
    }
  }
  // ==========================================================
  // LOAD ALERTS
  // ==========================================================
  const loadAlerts = async (userId = selectedUserId) => {
    try {
      setLoadingAlerts(true)
      // ------------------------------------------------------
      // ALL PROTECTED USERS
      // ------------------------------------------------------
      if (userId === 'all') {
        const results = []
        for (
          const protectedUser
          of users
        ) {
          try {
            const data =
              await getProtectedUserAlerts(
                protectedUser.user ||
                protectedUser.id
              )
            const userAlerts =
              Array.isArray(data)
                ? data
                : data?.results || []
            userAlerts.forEach(
              (alert) => {
                results.push({
                  ...alert,
                  protected_user_id:
                    protectedUser.user ||
                    protectedUser.id,
                  protected_user_name:
                    protectedUser.user_name ||
                    protectedUser.username ||
                    protectedUser.name ||
                    `User ${
                      protectedUser.user ||
                      protectedUser.id
                    }`,
                })
              }
            )
          } catch (error) {
            console.error(
              'Failed to load alerts for user:',
              protectedUser,
              error
            )
          }
        }
        setAlerts(results)
      }
      // ------------------------------------------------------
      // ONE PROTECTED USER
      // ------------------------------------------------------

      else {

        const data =
          await getProtectedUserAlerts(
            userId
          )

        const userAlerts =
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


        setAlerts(
          userAlerts.map(
            (alert) => ({

              ...alert,

              protected_user_id:
                userId,

              protected_user_name:
                selectedUser?.user_name ||
                selectedUser?.username ||
                selectedUser?.name ||
                `User ${userId}`,

            })
          )
        )

      }

    } catch (error) {

      console.error(
        'Failed to load guardian alerts:',
        error
      )

      Swal.fire({
        title: 'Unable to Load Alerts',
        text:
          error.response?.data?.detail ||
          'Unable to load alerts for the selected user.',
        icon: 'error',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })

    } finally {

      setLoadingAlerts(false)

    }

  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadProtectedUsers()

  }, [])


  // ==========================================================
  // LOAD ALERTS AFTER USERS LOAD
  // ==========================================================

  useEffect(() => {

    if (users.length > 0) {

      loadAlerts('all')

    } else if (!loadingUsers) {

      setAlerts([])

    }

  }, [users, loadingUsers])


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredAlerts =
    useMemo(() => {

      const search =
        query.toLowerCase().trim()


      return alerts.filter(
        (alert) => {

          const message =
            String(
              alert.message || ''
            ).toLowerCase()


          const userName =
            String(
              alert.protected_user_name ||
              ''
            ).toLowerCase()


          const geofence =
            String(
              alert.geofence_name ||
              alert.geofence ||
              ''
            ).toLowerCase()


          return (
            !search ||
            message.includes(search) ||
            userName.includes(search) ||
            geofence.includes(search)
          )

        }
      )

    }, [
      alerts,
      query,
    ])


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (value) => {

    if (!value) {

      return 'Unknown'

    }


    const date =
      new Date(value)


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

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
  // UI
  // ==========================================================

  return (

    <DashboardLayout
      title="Safety Alerts"
      subtitle="Monitor alerts generated by your protected users."
    >

      {/* ======================================================
          USER SELECTOR
      ====================================================== */}

      <div
        className="glass glass-card mb-4"
      >

        <div
          className="d-flex flex-wrap align-items-center justify-content-between gap-3"
        >

          <div>

            <h6
              className="mb-1 d-flex align-items-center gap-2"
            >

              <FiShield
                className="text-accent"
              />

              Protected User Alerts

            </h6>

            <div
              className="text-muted-swu"
              style={{
                fontSize: '0.75rem',
              }}
            >
              Choose a protected user or view alerts from everyone.
            </div>

          </div>


          <div
            className="d-flex align-items-center gap-2"
          >

            <select
              className="form-select form-control-swu"
              value={selectedUserId}
              onChange={(e) => {

                const value =
                  e.target.value

                setSelectedUserId(
                  value
                )

                loadAlerts(value)

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


              {users.map(
                (user) => {

                  const id =
                    user.user ||
                    user.id


                  const name =
                    user.user_name ||
                    user.username ||
                    user.name ||
                    `User ${id}`


                  return (

                    <option
                      key={id}
                      value={id}
                    >
                      {name}
                    </option>

                  )

                }
              )}

            </select>


            <button
              type="button"
              className="btn btn-swu-ghost d-flex align-items-center gap-2"
              onClick={() =>
                loadAlerts(
                  selectedUserId
                )
              }
              disabled={
                loadingAlerts ||
                users.length === 0
              }
            >

              <FiRefreshCw
                size={15}
              />

              Refresh

            </button>

          </div>

        </div>

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div
        className="d-flex justify-content-end mb-4"
      >

        <div
          className="position-relative"
          style={{
            minWidth: 260,
          }}
        >

          <FiSearch
            className="position-absolute text-faint-swu"
            size={15}
            style={{
              left: 12,
              top: 11,
            }}
          />

          <input
            type="text"
            className="form-control form-control-swu ps-5"
            placeholder="Search alerts..."
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
          />

        </div>

      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {(loadingUsers ||
        loadingAlerts) && (

        <div
          className="glass glass-card text-center py-5"
        >

          <div
            className="spinner-border"
            role="status"
            style={{
              color:
                '#26e0c9',
            }}
          />

          <div
            className="text-muted-swu mt-3"
            style={{
              fontSize:
                '0.85rem',
            }}
          >
            Loading safety alerts...
          </div>

        </div>

      )}


      {/* ======================================================
          NO USERS
      ====================================================== */}

      {!loadingUsers &&
        users.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >

          <FiUser
            size={44}
            className="text-accent mb-3"
          />

          <h6 className="fw-bold">
            No Protected Users
          </h6>

          <p
            className="text-muted-swu mb-0"
            style={{
              fontSize:
                '0.82rem',
            }}
          >
            You don't have any protected users yet.
          </p>

        </div>

      )}


      {/* ======================================================
          NO ALERTS
      ====================================================== */}

      {!loadingUsers &&
        !loadingAlerts &&
        users.length > 0 &&
        filteredAlerts.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >

          <FiAlertTriangle
            size={44}
            className="text-accent mb-3"
          />

          <h6 className="fw-bold">
            No Safety Alerts
          </h6>

          <p
            className="text-muted-swu mb-0"
            style={{
              fontSize:
                '0.82rem',
            }}
          >
            No alerts match the current selection.
          </p>

        </div>

      )}


      {/* ======================================================
          ALERT LIST
      ====================================================== */}

      {!loadingUsers &&
        !loadingAlerts &&
        filteredAlerts.length > 0 && (

        <div
          className="d-flex flex-column gap-3"
        >

          {filteredAlerts.map(
            (alert) => (

            <div
              key={alert.id}
              className="glass glass-card"
            >

              <div className="row g-4">


                {/* =================================================
                    ALERT DETAILS
                ================================================= */}

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
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          background:
                            'rgba(255,77,94,0.10)',
                        }}
                      >

                        <FiAlertTriangle
                          className="text-danger-swu"
                          size={20}
                        />

                      </div>


                      <div>

                        <h6
                          className="fw-bold mb-1"
                        >
                          Safe Zone Alert
                        </h6>

                        <div
                          className="text-muted-swu"
                          style={{
                            fontSize:
                              '0.72rem',
                          }}
                        >
                          Alert #{alert.id}
                        </div>

                      </div>

                    </div>

                    <span
                      className="status-dot danger"
                    />

                  </div>


                  {/* Message */}

                  <div
                    className="mb-3"
                    style={{
                      fontSize:
                        '0.9rem',
                    }}
                  >
                    {alert.message ||
                      'Safety alert'}
                  </div>


                  {/* Protected user */}

                  <div
                    className="d-flex align-items-center gap-2 mb-2"
                    style={{
                      fontSize:
                        '0.82rem',
                    }}
                  >

                    <FiUser
                      className="text-accent"
                      size={14}
                    />

                    <span className="text-muted-swu">
                      User:
                    </span>

                    <span>
                      {alert.protected_user_name}
                    </span>

                  </div>


                  {/* Zone */}

                  <div
                    className="d-flex align-items-center gap-2 mb-2"
                    style={{
                      fontSize:
                        '0.82rem',
                    }}
                  >

                    <FiShield
                      className="text-accent"
                      size={14}
                    />

                    <span className="text-muted-swu">
                      Safe Zone:
                    </span>

                    <span>
                      {alert.geofence_name ||
                        alert.geofence ||
                        'Unknown'}
                    </span>

                  </div>


                  {/* Time */}

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

                    {formatTime(
                      alert.created_at
                    )}

                  </div>

                </div>


                {/* =================================================
                    LOCATION
                ================================================= */}

                <div className="col-lg-4">

                  <div
                    className="glass p-3 h-100"
                  >

                    <div
                      className="d-flex align-items-center gap-2 mb-3"
                    >

                      <FiMapPin
                        className="text-accent"
                      />

                      <span
                        className="fw-semibold"
                      >
                        Alert Location
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

                        <div
                          className="text-muted-swu"
                        >
                          Latitude
                        </div>

                        <div>
                          {alert.latitude ??
                            'Unavailable'}
                        </div>

                      </div>


                      <div>

                        <div
                          className="text-muted-swu"
                        >
                          Longitude
                        </div>

                        <div>
                          {alert.longitude ??
                            'Unavailable'}
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </DashboardLayout>

  )
}