import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  FiMapPin,
  FiUsers,
  FiShield,
  FiClock,
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiNavigation,
  FiRefreshCw,
} from 'react-icons/fi'

import Swal from 'sweetalert2'

import DashboardLayout
  from '../../layouts/DashboardLayout.jsx'

import LocationMap
  from '../../components/LocationMap.jsx'

import api from '../../services/api'


// ============================================================
// GREETING
// ============================================================

function getGreeting() {

  const hour =
    new Date().getHours()

  if (
    hour >= 5 &&
    hour < 12
  ) {
    return 'Good Morning'
  }

  if (
    hour >= 12 &&
    hour < 17
  ) {
    return 'Good Afternoon'
  }

  if (
    hour >= 17 &&
    hour < 21
  ) {
    return 'Good Evening'
  }

  return 'Good Night'
}


// ============================================================
// DISTANCE CALCULATION
// ============================================================

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const earthRadius = 6371000

  const toRadians = (value) =>
    (value * Math.PI) / 180

  const dLat =
    toRadians(lat2 - lat1)

  const dLon =
    toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      toRadians(lat1)
    ) *
      Math.cos(
        toRadians(lat2)
      ) *
      Math.sin(dLon / 2) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadius * c
}


// ============================================================
// USER DASHBOARD
// ============================================================

export default function UserDashboard() {

  const [profile, setProfile] =
    useState(null)

  const [location, setLocation] =
    useState(null)

  const [contacts, setContacts] =
    useState([])

  const [zones, setZones] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [activeEmergency, setActiveEmergency] =
    useState(null)

  const [elapsed, setElapsed] =
    useState(0)

  const [emergencyLoading, setEmergencyLoading] =
    useState(false)

  const greeting =
    getGreeting()


  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const loadDashboard = async (
    showLoader = true
  ) => {

    try {

      if (showLoader) {
        setLoading(true)
      }

      setRefreshing(true)


      const [
        profileResponse,
        locationResponse,
        contactsResponse,
        zonesResponse,
        emergenciesResponse,
      ] = await Promise.allSettled([

        api.get(
          '/accounts/profile/'
        ),

        api.get(
          '/tracking/location/'
        ),

        api.get(
          '/guardian/users/'
        ),

        api.get(
          '/geofence/'
        ),

        api.get(
          '/emergency/'
        ),

      ])


      // --------------------------------------------------------
      // PROFILE
      // --------------------------------------------------------

      if (
        profileResponse.status ===
        'fulfilled'
      ) {

        setProfile(
          profileResponse.value.data
        )

      }


      // --------------------------------------------------------
      // LOCATION
      // --------------------------------------------------------

      if (
        locationResponse.status ===
        'fulfilled'
      ) {

        const data =
          locationResponse.value.data

        if (
          data &&
          data.latitude !== undefined &&
          data.longitude !== undefined
        ) {

          setLocation({

            latitude:
              Number(data.latitude),

            longitude:
              Number(data.longitude),

            accuracy:
              data.accuracy !== undefined &&
              data.accuracy !== null
                ? Number(data.accuracy)
                : null,

            updated_at:
              data.updated_at ||
              null,

          })

        }

      }


      // --------------------------------------------------------
      // TRUSTED CONTACTS
      // --------------------------------------------------------

      if (
        contactsResponse.status ===
        'fulfilled'
      ) {

        const data =
          contactsResponse.value.data

        setContacts(
          Array.isArray(data)
            ? data
            : data?.results || []
        )

      }


      // --------------------------------------------------------
      // SAFETY ZONES
      // --------------------------------------------------------

      if (
        zonesResponse.status ===
        'fulfilled'
      ) {

        const data =
          zonesResponse.value.data

        setZones(
          Array.isArray(data)
            ? data
            : data?.results || []
        )

      }


      // --------------------------------------------------------
      // ACTIVE EMERGENCY
      // --------------------------------------------------------

      if (
        emergenciesResponse.status ===
        'fulfilled'
      ) {

        const data =
          emergenciesResponse.value.data

        const emergencies =
          Array.isArray(data)
            ? data
            : data?.results || []


        const active =
          emergencies.find(
            (item) =>
              item.status === 'active'
          )


        if (active) {

          setActiveEmergency(
            active
          )

        }

      }

    } catch (error) {

      console.error(
        'Dashboard loading error:',
        error
      )

    } finally {

      setLoading(false)
      setRefreshing(false)

    }
  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadDashboard()

  }, [])


  // ==========================================================
  // REFRESH LOCATION / DASHBOARD
  // ==========================================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        loadDashboard(false)

      }, 10000)


    return () => {

      clearInterval(
        interval
      )

    }

  }, [])


  // ==========================================================
  // EMERGENCY TIMER
  // ==========================================================

  useEffect(() => {

    if (!activeEmergency) {
      setElapsed(0)
      return
    }


    const createdAt =
      new Date(
        activeEmergency.created_at
      ).getTime()


    const updateTimer = () => {

      const seconds = Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            createdAt
          ) / 1000
        )
      )

      setElapsed(
        seconds
      )

    }


    updateTimer()


    const interval =
      setInterval(
        updateTimer,
        1000
      )


    return () => {

      clearInterval(
        interval
      )

    }

  }, [
    activeEmergency,
  ])


  // ==========================================================
  // CURRENT SAFE ZONE
  // ==========================================================

  const safeZoneStatus =
    useMemo(() => {

      if (
        !location ||
        !zones.length
      ) {

        return {
          inside: false,
          zone: null,
          distance: null,
        }

      }


      let nearestZone =
        null

      let nearestDistance =
        Infinity


      for (
        const zone of zones
      ) {

        const zoneLat =
          Number(
            zone.latitude
          )

        const zoneLng =
          Number(
            zone.longitude
          )

        const radius =
          Number(
            zone.radius
          )


        if (
          !Number.isFinite(
            zoneLat
          ) ||
          !Number.isFinite(
            zoneLng
          ) ||
          !Number.isFinite(
            radius
          )
        ) {

          continue

        }


        const distance =
          calculateDistance(

            location.latitude,
            location.longitude,

            zoneLat,
            zoneLng

          )


        if (
          distance <
          nearestDistance
        ) {

          nearestDistance =
            distance

          nearestZone =
            zone

        }

      }


      if (!nearestZone) {

        return {
          inside: false,
          zone: null,
          distance: null,
        }

      }


      const inside =
        nearestDistance <=
        Number(
          nearestZone.radius
        )


      return {

        inside,

        zone:
          nearestZone,

        distance:
          nearestDistance,

      }

    }, [
      location,
      zones,
    ])


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (
    value
  ) => {

    if (!value) {
      return '--'
    }


    const date =
      new Date(value)


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return '--'

    }


    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
    )

  }


  // ==========================================================
  // FORMAT TIMER
  // ==========================================================

  const formatTimer = (
    seconds
  ) => {

    return `${String(
      Math.floor(
        seconds / 60
      )
    ).padStart(2, '0')}:${String(
      seconds % 60
    ).padStart(2, '0')}`

  }


  // ==========================================================
  // ACTIVATE SOS
  // ==========================================================

  const activateSOS = async () => {

    if (
      emergencyLoading ||
      activeEmergency
    ) {

      return

    }


    try {

      setEmergencyLoading(
        true
      )


      let currentLatitude =
        location?.latitude ||
        null

      let currentLongitude =
        location?.longitude ||
        null


      // --------------------------------------------------------
      // TRY TO GET FRESH GPS
      // --------------------------------------------------------

      if (
        navigator.geolocation
      ) {

        try {

          const position =
            await new Promise(
              (
                resolve,
                reject
              ) => {

                navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy:
                      true,
                    timeout:
                      10000,
                    maximumAge:
                      5000,
                  }
                )

              }
            )


          currentLatitude =
            position.coords.latitude

          currentLongitude =
            position.coords.longitude


          setLocation({

            latitude:
              currentLatitude,

            longitude:
              currentLongitude,

            accuracy:
              position.coords.accuracy,

            updated_at:
              new Date().toISOString(),

          })


        } catch (locationError) {

          console.warn(
            'Fresh GPS unavailable:',
            locationError
          )

        }

      }


      // --------------------------------------------------------
      // CREATE EMERGENCY
      // --------------------------------------------------------

      const response =
        await api.post(
          '/emergency/',
          {

            emergency_type:
              'sos',

            message:
              'Emergency SOS triggered',

            latitude:
              currentLatitude,

            longitude:
              currentLongitude,

          }
        )


      setActiveEmergency(
        response.data
      )


      await Swal.fire({

        title:
          'SOS Activated',

        text:
          'Your emergency alert has been triggered and your trusted contacts have been notified.',

        icon:
          'success',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',

      })


    } catch (error) {

      console.error(
        'SOS activation error:',
        error
      )


      Swal.fire({

        title:
          'SOS Failed',

        text:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Unable to activate the emergency.',

        icon:
          'error',

        confirmButtonColor:
          '#ff4d5e',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',

      })

    } finally {

      setEmergencyLoading(
        false
      )

    }

  }


  // ==========================================================
  // CANCEL SOS
  // ==========================================================

  const cancelSOS = async () => {

    if (
      !activeEmergency?.id
    ) {

      return

    }


    const result =
      await Swal.fire({

        title:
          'Cancel emergency?',

        text:
          'Your trusted contacts will be notified that you are safe.',

        icon:
          'question',

        showCancelButton:
          true,

        confirmButtonText:
          'Yes, cancel SOS',

        cancelButtonText:
          'Keep active',

        confirmButtonColor:
          '#26e0c9',

        cancelButtonColor:
          '#5b6472',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',

      })


    if (
      !result.isConfirmed
    ) {

      return

    }


    try {

      setEmergencyLoading(
        true
      )


      await api.patch(
        `/emergency/${activeEmergency.id}/cancel/`
      )


      setActiveEmergency(
        null
      )


      setElapsed(0)


      await Swal.fire({

        title:
          'Emergency Cancelled',

        text:
          'Your emergency has been cancelled successfully.',

        icon:
          'success',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',

      })


    } catch (error) {

      console.error(
        'SOS cancellation error:',
        error
      )


      Swal.fire({

        title:
          'Unable to Cancel',

        text:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Unable to cancel the emergency.',

        icon:
          'error',

        confirmButtonColor:
          '#ff4d5e',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',

      })

    } finally {

      setEmergencyLoading(
        false
      )

    }

  }


  // ==========================================================
  // CONTACT NAME
  // ==========================================================

  const getContactName = (
    contact
  ) => {

    return (
      contact.name ||
      contact.username ||
      contact.user_name ||
      'Trusted Contact'
    )

  }


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (

      <DashboardLayout
        title="Dashboard"
        subtitle="Loading your safety information..."
      >

        <div
          className="glass glass-card text-center py-5"
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
              fontSize:
                '0.85rem',
            }}
          >
            Loading your safety dashboard...
          </div>

        </div>

      </DashboardLayout>

    )

  }


  return (

    <DashboardLayout
      title={`${greeting}, ${
        profile?.username ||
        'User'
      } 👋`}
      subtitle="Your safety dashboard is active."
    >

      {/* =====================================================
          REFRESH
      ===================================================== */}

      <div
        className="d-flex justify-content-end mb-3"
      >

        <button
          type="button"
          className="btn btn-swu-ghost d-flex align-items-center gap-2"
          onClick={() =>
            loadDashboard()
          }
          disabled={refreshing}
        >

          <FiRefreshCw
            size={14}
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}

        </button>

      </div>


      {/* =====================================================
          SOS + LOCATION
      ===================================================== */}

      <div className="row g-4 mb-4">

        {/* ===================================================
            SOS
        =================================================== */}

        <div className="col-lg-5">

          <div
            className="glass glass-card h-100 text-center d-flex flex-column justify-content-center py-5"
          >

            {activeEmergency && (

              <div
                className="glass mb-4 mx-auto px-4 py-2"
                style={{
                  maxWidth: 280,
                }}
              >

                <div
                  className="d-flex align-items-center justify-content-center gap-2 text-danger-swu fw-bold"
                  style={{
                    fontSize:
                      '0.85rem',
                  }}
                >

                  <span
                    className="status-dot danger"
                  />

                  SOS ACTIVE

                </div>

              </div>

            )}


            <button
              type="button"
              className="mx-auto"
              onClick={
                activateSOS
              }
              disabled={
                emergencyLoading ||
                Boolean(
                  activeEmergency
                )
              }
              style={{
                width: 180,
                height: 180,
                borderRadius:
                  '50%',
                border:
                  '3px solid rgba(255,77,94,0.65)',
                background:
                  'radial-gradient(circle, rgba(255,77,94,0.30), rgba(255,77,94,0.08))',
                color:
                  '#ff5c6c',
                boxShadow:
                  '0 0 35px rgba(255,77,94,0.22)',
                cursor:
                  activeEmergency ||
                  emergencyLoading
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  emergencyLoading
                    ? 0.65
                    : 1,
                fontWeight:
                  800,
                fontSize:
                  '1.4rem',
                letterSpacing:
                  '1px',
              }}
            >

              {emergencyLoading
                ? '...'
                : activeEmergency
                  ? 'ACTIVE'
                  : 'SOS'}

            </button>


            <div
              className="mt-4 text-muted-swu"
              style={{
                fontSize:
                  '0.85rem',
              }}
            >

              {activeEmergency
                ? 'Emergency is currently active.'
                : 'Press the SOS button for emergency assistance.'}

            </div>


            {activeEmergency && (

              <div className="row g-2 mt-4 text-start font-mono">

                <div className="col-6">

                  <div className="glass p-2">

                    <span
                      className="status-dot on me-2"
                    />

                    Location Sharing

                  </div>

                </div>


                <div className="col-6">

                  <div className="glass p-2">

                    <span
                      className="status-dot on me-2"
                    />

                    Contacts Notified

                  </div>

                </div>


                <div className="col-6">

                  <div className="glass p-2">

                    <FiClock
                      size={11}
                      className="me-1"
                    />

                    {formatTimer(
                      elapsed
                    )}

                  </div>

                </div>


                <div className="col-6">

                  <div className="glass p-2">

                    <span
                      className="status-dot danger me-2"
                    />

                    Emergency Active

                  </div>

                </div>

              </div>

            )}


            {activeEmergency && (

              <button
                type="button"
                className="btn btn-swu-danger mt-4"
                onClick={
                  cancelSOS
                }
                disabled={
                  emergencyLoading
                }
              >

                <FiX
                  className="me-1"
                />

                {emergencyLoading
                  ? 'Cancelling...'
                  : 'Cancel Emergency'}

              </button>

            )}

          </div>

        </div>


        {/* ===================================================
            LIVE LOCATION
        =================================================== */}

        <div className="col-lg-7">

          <div
            className="glass glass-card h-100"
          >

            <div
              className="d-flex align-items-center justify-content-between mb-3"
            >

              <h6
                className="mb-0 d-flex align-items-center gap-2"
              >

                <FiMapPin
                  className="text-accent"
                />

                Live Location

              </h6>

              <Link
                to="/location"
                className="text-accent"
                style={{
                  fontSize:
                    '0.76rem',
                }}
              >
                Open
              </Link>

            </div>


            <div
              className="position-relative"
              style={{
                height: 360,
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >

              {location ? (

                <LocationMap
                  latitude={location.latitude}
                  longitude={location.longitude}
                  accuracy={location.accuracy || 50}
                />

              ) : (

                <div
                  className="d-flex flex-column align-items-center justify-content-center h-100"
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(38,224,201,0.10), transparent 62%)',
                  }}
                >

                  <FiMapPin
                    size={38}
                    className="text-muted-swu mb-3"
                  />

                  <div
                    className="text-muted-swu"
                    style={{
                      fontSize: '0.82rem',
                    }}
                  >
                    Location unavailable
                  </div>

                </div>

              )}

            </div>

            {location && (
              <div className="glass mt-3 p-3">

                <div
                  className="d-flex align-items-center justify-content-between"
                  style={{
                    fontSize: '0.74rem',
                  }}
                >

                  <span className="text-muted-swu">
                    Coordinates
                  </span>

                  <span className="font-mono">
                    {location.latitude.toFixed(6)}
                    {' , '}
                    {location.longitude.toFixed(6)}
                  </span>

                </div>

                <div
                  className="d-flex align-items-center justify-content-between mt-2"
                  style={{
                    fontSize: '0.7rem',
                  }}
                >

                  <span className="text-muted-swu">
                    Updated
                  </span>

                  <span>
                    {formatTime(location.updated_at)}
                  </span>

                </div>

              </div>
            )}

          </div>
        </div>
      </div>


      {/* =====================================================
          TRUSTED CONTACTS + SAFETY STATUS + SAFE ZONE
      ===================================================== */}

      <div className="row g-4 mb-4">

        {/* ===================================================
            TRUSTED CONTACTS
        =================================================== */}

        <div className="col-lg-4 col-md-6">

          <div
            className="glass glass-card h-100"
          >

            <div
              className="d-flex align-items-center justify-content-between mb-3"
            >

              <h6
                className="mb-0 d-flex align-items-center gap-2"
              >

                <FiUsers
                  className="text-accent"
                />

                Trusted Contacts

              </h6>

              <Link
                to="/contacts"
                className="text-accent"
                style={{
                  fontSize:
                    '0.75rem',
                }}
              >
                View all
              </Link>

            </div>


            {contacts.length === 0 ? (

              <div
                className="text-muted-swu"
                style={{
                  fontSize:
                    '0.82rem',
                }}
              >

                No trusted contacts added yet.

                <div className="mt-3">

                  <Link
                    to="/contacts"
                    className="btn btn-sm btn-swu-primary"
                  >
                    Add Contact
                  </Link>

                </div>

              </div>

            ) : (

              contacts
                .slice(0, 4)
                .map((contact) => (

                  <div
                    key={
                      contact.id ||
                      contact.user
                    }
                    className="d-flex align-items-center gap-2 mb-3"
                  >

                    <div
                      className="d-flex align-items-center justify-content-center font-mono flex-shrink-0"
                      style={{
                        width:
                          36,
                        height:
                          36,
                        borderRadius:
                          '50%',
                        background:
                          'var(--surface-strong)',
                        fontSize:
                          '0.7rem',
                        fontWeight:
                          700,
                      }}
                    >

                      {getContactName(
                        contact
                      )
                        .slice(
                          0,
                          1
                        )
                        .toUpperCase()}

                    </div>


                    <div
                      className="flex-grow-1"
                      style={{
                        fontSize:
                          '0.84rem',
                      }}
                    >

                      <div>
                        {getContactName(
                          contact
                        )}
                      </div>

                      <div
                        className="text-faint-swu"
                        style={{
                          fontSize:
                            '0.7rem',
                        }}
                      >

                        {contact.relationship ||
                          'Trusted User'}

                      </div>

                    </div>


                    <span
                      className="status-dot on"
                    />

                  </div>

                ))

            )}

          </div>

        </div>


        {/* ===================================================
            SAFETY STATUS
        =================================================== */}

        <div className="col-lg-4 col-md-6">

          <div
            className="glass glass-card h-100"
          >

            <h6
              className="mb-3 d-flex align-items-center gap-2"
            >

              <FiShield
                className="text-accent"
              />

              Safety Status

            </h6>


            <div
              className="d-flex align-items-center justify-content-between py-2"
              style={{
                borderBottom:
                  '1px solid var(--border-soft)',
                fontSize:
                  '0.84rem',
              }}
            >

              <span
                className="text-muted-swu"
              >
                Account Protection
              </span>

              <span
                className="d-flex align-items-center gap-2"
              >

                <span
                  className="status-dot on"
                />

                Active

              </span>

            </div>


            <div
              className="d-flex align-items-center justify-content-between py-2"
              style={{
                borderBottom:
                  '1px solid var(--border-soft)',
                fontSize:
                  '0.84rem',
              }}
            >

              <span
                className="text-muted-swu"
              >
                Location Sharing
              </span>

              <span
                className="d-flex align-items-center gap-2"
              >

                <span
                  className={
                    location
                      ? 'status-dot on'
                      : 'status-dot off'
                  }
                />

                {location
                  ? 'Active'
                  : 'Unavailable'}

              </span>

            </div>


            <div
              className="d-flex align-items-center justify-content-between py-2"
              style={{
                borderBottom:
                  '1px solid var(--border-soft)',
                fontSize:
                  '0.84rem',
              }}
            >

              <span
                className="text-muted-swu"
              >
                Emergency Contacts
              </span>

              <span
                className={
                  contacts.length
                    ? 'status-dot on'
                    : 'status-dot off'
                }
              />

            </div>


            <div
              className="d-flex align-items-center justify-content-between py-2"
              style={{
                fontSize:
                  '0.84rem',
              }}
            >

              <span
                className="text-muted-swu"
              >
                Safe Zone
              </span>

              <span
                className="d-flex align-items-center gap-2"
              >

                <span
                  className={
                    safeZoneStatus.inside
                      ? 'status-dot on'
                      : 'status-dot warn'
                  }
                />

                {safeZoneStatus.inside
                  ? 'Safe'
                  : safeZoneStatus.zone
                    ? 'Outside'
                    : 'Not Set'}

              </span>

            </div>

          </div>

        </div>


        {/* ===================================================
            SAFE ZONE
        =================================================== */}

        <div className="col-lg-4 col-md-12">

          <div
            className="glass glass-card h-100"
          >

            <h6
              className="mb-3 d-flex align-items-center gap-2"
            >

              {safeZoneStatus.inside ? (

                <FiCheckCircle
                  className="text-accent"
                />

              ) : (

                <FiShield
                  className="text-accent"
                />

              )}

              Safe Zone Status

            </h6>


            {safeZoneStatus.zone ? (

              <>

                <div
                  className="d-flex align-items-center gap-2 mb-3"
                >

                  <span
                    className={
                      safeZoneStatus.inside
                        ? 'status-dot on'
                        : 'status-dot danger'
                    }
                  />

                  <span
                    className={
                      safeZoneStatus.inside
                        ? 'text-accent'
                        : 'text-danger-swu'
                    }
                    style={{
                      fontWeight:
                        600,
                    }}
                  >

                    {safeZoneStatus.inside
                      ? 'You are inside a safe zone'
                      : 'You are outside the nearest safe zone'}

                  </span>

                </div>


                <div
                  className="glass p-3"
                >

                  <div
                    className="fw-semibold"
                    style={{
                      fontSize:
                        '0.9rem',
                    }}
                  >

                    {safeZoneStatus.zone.name}

                  </div>


                  <div
                    className="text-muted-swu mt-1"
                    style={{
                      fontSize:
                        '0.72rem',
                    }}
                  >

                    Radius:{' '}

                    {safeZoneStatus.zone.radius}
                    {' '}m

                  </div>


                  <div
                    className="font-mono text-accent mt-2"
                    style={{
                      fontSize:
                        '0.78rem',
                    }}
                  >

                    {Math.round(
                      safeZoneStatus.distance
                    )}{' '}m from center

                  </div>

                </div>


              </>

            ) : (

              <div
                className="text-muted-swu"
                style={{
                  fontSize:
                    '0.82rem',
                }}
              >

                No safety zone has been configured yet.

                <div className="mt-3">

                  <Link
                    to="/safety-zones"
                    className="btn btn-sm btn-swu-primary"
                  >
                    Create Safety Zone
                  </Link>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="row g-4">

        <div className="col-12">

          <div
            className="glass glass-card"
          >

            <h6 className="mb-3">
              Safety Controls
            </h6>


            <div className="row g-3">

              <div className="col-md-4">

                <Link
                  to="/emergency"
                  className="btn btn-swu-ghost w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                >

                  <FiAlertTriangle
                    size={17}
                  />

                  Emergency Center

                </Link>

              </div>


              <div className="col-md-4">

                <Link
                  to="/location"
                  className="btn btn-swu-ghost w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                >

                  <FiNavigation
                    size={17}
                  />

                  Live Location

                </Link>

              </div>


              <div className="col-md-4">

                <Link
                  to="/safety-zones"
                  className="btn btn-swu-ghost w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                >

                  <FiShield
                    size={17}
                  />

                  Safety Zones

                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  )
}