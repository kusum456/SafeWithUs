import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiMapPin,
  FiUsers,
  FiShield,
  FiBell,
  FiAlertTriangle,
  FiClock,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import LocationMap from '../../components/LocationMap.jsx'

import {
  getProtectedUsers,
  getProtectedUserAlerts,
} from '../../services/guardianService.js'

import {
  getProtectedUserLocation,
} from '../../services/guardianService.js'

import {
  getProtectedUserEmergencies,
} from '../../services/guardianService.js'


export default function GuardianDashboard() {

  const [profileName, setProfileName] = useState('Guardian')

  const [users, setUsers] = useState([])

  const [alerts, setAlerts] = useState([])

  const [emergencies, setEmergencies] = useState([])

  const [locations, setLocations] = useState([])

  const [selectedUser, setSelectedUser] = useState(null)

  const [loading, setLoading] = useState(true)


  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const loadDashboard = async () => {

    try {

      setLoading(true)

      const protectedUsers =
        await getProtectedUsers()

      const userList =
        Array.isArray(protectedUsers)
          ? protectedUsers
          : protectedUsers?.results || []

      setUsers(userList)


      if (userList.length === 0) {

        setAlerts([])
        setEmergencies([])
        setLocations([])

        return
      }


      const allAlerts = []
      const allEmergencies = []
      const allLocations = []


      for (const protectedUser of userList) {

        const userId =
          protectedUser.user ||
          protectedUser.id


        const userName =
          protectedUser.user_name ||
          protectedUser.username ||
          protectedUser.name ||
          `User ${userId}`


        // ----------------------------------------------
        // ALERTS
        // ----------------------------------------------

        try {

          const alertResponse =
            await getProtectedUserAlerts(
              userId
            )

          const userAlerts =
            Array.isArray(alertResponse)
              ? alertResponse
              : alertResponse?.results || []


          userAlerts.forEach((alert) => {

            allAlerts.push({
              ...alert,
              protected_user_id:
                userId,
              protected_user_name:
                userName,
            })

          })

        } catch (error) {

          console.error(
            `Alert error for user ${userId}:`,
            error
          )

        }


        // ----------------------------------------------
        // EMERGENCIES
        // ----------------------------------------------

        try {

          const emergencyResponse =
            await getProtectedUserEmergencies(
              userId
            )

          const userEmergencies =
            Array.isArray(emergencyResponse)
              ? emergencyResponse
              : emergencyResponse?.results || []


          userEmergencies.forEach(
            (emergency) => {

              allEmergencies.push({
                ...emergency,
                protected_user_id:
                  userId,
                protected_user_name:
                  userName,
              })

            }
          )

        } catch (error) {

          console.error(
            `Emergency error for user ${userId}:`,
            error
          )

        }


        // ----------------------------------------------
        // LOCATION
        // ----------------------------------------------

        try {

          const locationResponse =
            await getProtectedUserLocation(
              userId
            )

          if (
            locationResponse &&
            locationResponse.latitude !== undefined &&
            locationResponse.longitude !== undefined
          ) {

            allLocations.push({

              ...locationResponse,

              protected_user_id:
                userId,

              protected_user_name:
                userName,

            })

          }

        } catch (error) {

          console.error(
            `Location error for user ${userId}:`,
            error
          )

        }

      }


      setAlerts(allAlerts)
      setEmergencies(allEmergencies)
      setLocations(allLocations)


      if (userList.length > 0) {

        const firstUser =
          userList[0]

        const firstUserId =
          firstUser.user ||
          firstUser.id

        setSelectedUser(
          firstUserId
        )

      }

    } catch (error) {

      console.error(
        'Guardian dashboard error:',
        error
      )

      Swal.fire({
        title: 'Dashboard Error',
        text:
          error.response?.data?.detail ||
          'Unable to load guardian dashboard.',
        icon: 'error',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {

    loadDashboard()

  }, [])


  // ==========================================================
  // ACTIVE SOS
  // ==========================================================

  const activeEmergencies =
    useMemo(() => {

      return emergencies.filter(
        (emergency) =>
          emergency.status === 'active'
      )

    }, [emergencies])


  // ==========================================================
  // RECENT ALERTS
  // ==========================================================

  const recentAlerts =
    useMemo(() => {

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


  // ==========================================================
  // SELECTED USER LOCATION
  // ==========================================================

  const selectedLocation =
    locations.find(
      (location) =>
        String(
          location.protected_user_id
        ) === String(
          selectedUser
        )
    )


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


  return (

    <DashboardLayout
      title={`Guardian Dashboard`}
      subtitle="Monitor the safety of your protected users."
    >

      {/* =====================================================
          REFRESH
      ===================================================== */}

      {/* <div className="d-flex justify-content-end mb-3">

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
            : 'Refresh'}

        </button>

      </div> */}


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="row g-4 mb-4">

        {/* Protected Users */}

        <div className="col-xl-3 col-md-6">

          <div className="glass glass-card h-100">

            <div className="d-flex justify-content-between">

              <div>

                <div
                  className="text-muted-swu mb-2"
                  style={{
                    fontSize: '0.78rem',
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

              <FiUsers
                className="text-accent"
                size={24}
              />

            </div>

          </div>

        </div>


        {/* Active SOS */}

        <div className="col-xl-3 col-md-6">

          <div className="glass glass-card h-100">

            <div className="d-flex justify-content-between">

              <div>

                <div
                  className="text-muted-swu mb-2"
                  style={{
                    fontSize: '0.78rem',
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

              <FiAlertTriangle
                className="text-danger-swu"
                size={24}
              />

            </div>

          </div>

        </div>


        {/* Alerts */}

        <div className="col-xl-3 col-md-6">

          <div className="glass glass-card h-100">

            <div className="d-flex justify-content-between">

              <div>

                <div
                  className="text-muted-swu mb-2"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >
                  Safety Alerts
                </div>

                <div
                  className="font-mono fw-bold text-accent"
                  style={{
                    fontSize: '1.8rem',
                  }}
                >
                  {alerts.length}
                </div>

              </div>

              <FiBell
                className="text-accent"
                size={24}
              />

            </div>

          </div>

        </div>


        {/* Live Locations */}

        <div className="col-xl-3 col-md-6">

          <div className="glass glass-card h-100">

            <div className="d-flex justify-content-between">

              <div>

                <div
                  className="text-muted-swu mb-2"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >
                  Live Locations
                </div>

                <div
                  className="font-mono fw-bold"
                  style={{
                    fontSize: '1.8rem',
                  }}
                >
                  {locations.length}
                </div>

              </div>

              <FiMapPin
                className="text-accent"
                size={24}
              />

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          PROTECTED USERS
      ===================================================== */}

      <div className="row g-4 mb-4">

        <div className="col-lg-5">

          <div className="glass glass-card h-100">

            <div
              className="d-flex align-items-center justify-content-between mb-3"
            >

              <h6 className="mb-0 d-flex align-items-center gap-2">

                <FiUsers
                  className="text-accent"
                />

                Protected Users

              </h6>

              <Link
                to="/guardian/users"
                className="text-accent"
                style={{
                  fontSize: '0.75rem',
                }}
              >
                View all
              </Link>

            </div>


            {users.length === 0 ? (

              <div
                className="text-center py-4 text-muted-swu"
              >
                No protected users yet.
              </div>

            ) : (

              <div
                className="d-flex flex-column gap-2"
              >

                {users
                  .slice(0, 5)
                  .map((user) => {

                    const id =
                      user.user ||
                      user.id

                    const name =
                      user.user_name ||
                      user.username ||
                      user.name ||
                      `User ${id}`


                    const location =
                      locations.find(
                        (item) =>
                          String(
                            item.protected_user_id
                          ) === String(id)
                      )


                    const activeSOS =
                      activeEmergencies.some(
                        (item) =>
                          String(
                            item.protected_user_id
                          ) === String(id)
                      )


                    return (

                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          setSelectedUser(
                            id
                          )
                        }
                        className="text-start"
                        style={{
                          width: '100%',
                          border:
                            selectedUser == id
                              ? '1px solid rgba(38,224,201,0.5)'
                              : '1px solid var(--border-soft)',
                          background:
                            selectedUser == id
                              ? 'rgba(38,224,201,0.08)'
                              : 'var(--surface)',
                          color:
                            'var(--text)',
                          borderRadius:
                            14,
                          padding: 12,
                          cursor: 'pointer',
                        }}
                      >

                        <div
                          className="d-flex align-items-center justify-content-between"
                        >

                          <div
                            className="d-flex align-items-center gap-2"
                          >

                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius:
                                  '50%',
                                background:
                                  'var(--surface-strong)',
                              }}
                            >

                              <FiUserIcon
                                name={name}
                              />

                            </div>


                            <div>

                              <div
                                style={{
                                  fontSize:
                                    '0.85rem',
                                  fontWeight:
                                    600,
                                }}
                              >
                                {name}
                              </div>

                              <div
                                className="text-muted-swu"
                                style={{
                                  fontSize:
                                    '0.68rem',
                                }}
                              >

                                {location
                                  ? 'Location active'
                                  : 'No location'}

                              </div>

                            </div>

                          </div>


                          <span
                            className={
                              activeSOS
                                ? 'status-dot danger'
                                : location
                                  ? 'status-dot on'
                                  : 'status-dot off'
                            }
                          />

                        </div>

                      </button>

                    )

                  })}

              </div>

            )}

          </div>

        </div>


        {/* =====================================================
            SELECTED USER LOCATION
        ===================================================== */}

        <div className="col-lg-7">

          <div className="glass glass-card h-100">

            <div
              className="d-flex align-items-center justify-content-between mb-3"
            >

              <h6
                className="mb-0 d-flex align-items-center gap-2"
              >

                <FiMapPin
                  className="text-accent"
                />

                Current Location

              </h6>

              <span className="eyebrow">
                LIVE
              </span>

            </div>


            {selectedLocation ? (

              <div>

                <div
                  className="glass p-3 mb-3"
                >

                  <div className="fw-bold mb-1">

                    {selectedLocation.protected_user_name ||
                      'Protected User'}

                  </div>

                  <div
                    className="text-muted-swu"
                    style={{
                      fontSize:
                        '0.73rem',
                    }}
                  >

                    Last updated:{' '}

                    {formatTime(
                      selectedLocation.updated_at
                    )}

                  </div>

                </div>


                <div className="row g-3">

                  <div className="col-md-4">

                    <div
                      className="text-muted-swu"
                      style={{
                        fontSize:
                          '0.72rem',
                      }}
                    >
                      Latitude
                    </div>

                    <div className="font-mono">
                      {Number(
                        selectedLocation.latitude
                      ).toFixed(6)}
                    </div>

                  </div>


                  <div className="col-md-4">

                    <div
                      className="text-muted-swu"
                      style={{
                        fontSize:
                          '0.72rem',
                      }}
                    >
                      Longitude
                    </div>

                    <div className="font-mono">
                      {Number(
                        selectedLocation.longitude
                      ).toFixed(6)}
                    </div>

                  </div>


                  <div className="col-md-4">

                    <div
                      className="text-muted-swu"
                      style={{
                        fontSize:
                          '0.72rem',
                      }}
                    >
                      Accuracy
                    </div>

                    <div className="font-mono">
                      {selectedLocation.accuracy
                        ? `${Math.round(
                            selectedLocation.accuracy
                          )} m`
                        : 'N/A'}
                    </div>

                  </div>

                </div>


                <div
                  className="mt-4"
                  style={{
                    height: 360,
                    width: '100%',
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >

                  <LocationMap
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    accuracy={
                      selectedLocation.accuracy || 50
                    }
                  />

                </div>

              </div>

            ) : (

              <div
                className="text-center py-5 text-muted-swu"
              >

                Select a protected user to view
                their current location.

              </div>

            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          RECENT ALERTS
      ===================================================== */}

      <div className="row g-4">

        <div className="col-lg-7">

          <div className="glass glass-card h-100">

            <div
              className="d-flex align-items-center justify-content-between mb-3"
            >

              <h6
                className="mb-0 d-flex align-items-center gap-2"
              >

                <FiBell
                  className="text-accent"
                />

                Recent Safety Alerts

              </h6>

              <Link
                to="/guardian/alerts"
                className="text-accent d-flex align-items-center gap-1"
                style={{
                  fontSize:
                    '0.75rem',
                }}
              >

                View all

                <FiChevronRight
                  size={12}
                />

              </Link>

            </div>


            {recentAlerts.length === 0 ? (

              <div
                className="text-center py-4 text-muted-swu"
              >
                No recent safety alerts.
              </div>

            ) : (

              recentAlerts.map(
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
                          borderRadius:
                            11,
                          background:
                            'rgba(255,77,94,0.10)',
                        }}
                      >

                        <FiAlertTriangle
                          className="text-danger-swu"
                          size={17}
                        />

                      </div>


                      <div>

                        <div
                          style={{
                            fontSize:
                              '0.84rem',
                          }}
                        >

                          {alert.message ||
                            'Safety alert'}

                        </div>

                        <div
                          className="text-faint-swu"
                          style={{
                            fontSize:
                              '0.69rem',
                          }}
                        >

                          {alert.protected_user_name}

                          {' · '}

                          {formatTime(
                            alert.created_at
                          )}

                        </div>

                      </div>

                    </div>

                    <span
                      className="status-dot danger"
                    />

                  </div>

                )

              )

            )}

          </div>

        </div>


        {/* =====================================================
            GUARDIAN QUICK ACTIONS
        ===================================================== */}

        <div className="col-lg-5">

          <div
            className="glass glass-card h-100"
          >

            <h6 className="mb-3">
              Guardian Controls
            </h6>


            <Link
              to="/guardian/location"
              className="btn btn-swu-ghost w-100 mb-2 d-flex align-items-center justify-content-between"
            >

              <span
                className="d-flex align-items-center gap-2"
              >
                <FiMapPin size={15} />
                Live Location
              </span>

              <FiChevronRight
                size={14}
              />

            </Link>


            <Link
              to="/guardian/emergency"
              className="btn btn-swu-ghost w-100 mb-2 d-flex align-items-center justify-content-between"
            >

              <span
                className="d-flex align-items-center gap-2"
              >
                <FiAlertTriangle
                  size={15}
                />

                Emergency Status
              </span>

              <FiChevronRight
                size={14}
              />

            </Link>


            <Link
              to="/guardian/safety-zones"
              className="btn btn-swu-ghost w-100 mb-2 d-flex align-items-center justify-content-between"
            >

              <span
                className="d-flex align-items-center gap-2"
              >

                <FiShield size={15} />

                Safety Zones

              </span>

              <FiChevronRight
                size={14}
              />

            </Link>


            <Link
              to="/guardian/alerts"
              className="btn btn-swu-primary w-100 d-flex align-items-center justify-content-between"
            >

              <span
                className="d-flex align-items-center gap-2"
              >

                <FiBell size={15} />

                Safety Alerts

              </span>

              <FiChevronRight
                size={14}
              />

            </Link>

          </div>

        </div>

      </div>

    </DashboardLayout>

  )
}


// ==========================================================
// USER ICON
// ==========================================================

function FiUserIcon() {

  return (
    <FiUsers
      size={15}
      className="text-accent"
    />
  )

}