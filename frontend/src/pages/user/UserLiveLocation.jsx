import React, { useEffect, useMemo, useState } from 'react'

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  useMap,
} from 'react-leaflet'

import {
  FiTarget,
  FiClock,
  FiUsers,
  FiShield,
  FiMapPin,
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle,
} from 'react-icons/fi'

import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import {
  getCurrentLocation,
  updateCurrentLocation,
} from '../../services/trackingService.js'

import {
  getGuardianUsers,
} from '../../services/guardianService.js'

import {
  getGeofences,
} from '../../services/geofence.js'

import 'leaflet/dist/leaflet.css'


// ============================================================
// MAP CENTER
// ============================================================

function MapCenter({
  latitude,
  longitude,
}) {

  const map = useMap()

  useEffect(() => {

    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      return
    }

    map.setView(
      [
        Number(latitude),
        Number(longitude),
      ],
      16,
      {
        animate: true,
      }
    )

  }, [
    latitude,
    longitude,
    map,
  ])

  return null
}


// ============================================================
// DISTANCE
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
// LIVE LOCATION PAGE
// ============================================================

export default function UserLiveLocation() {

  const [location, setLocation] =
    useState(null)

  const [contacts, setContacts] =
    useState([])

  const [zones, setZones] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [sharing, setSharing] =
    useState(false)

  const [error, setError] =
    useState('')

  const [lastUpdated, setLastUpdated] =
    useState(null)

  const [refreshing, setRefreshing] =
    useState(false)


  // ==========================================================
  // GET SAVED LOCATION
  // ==========================================================

  const loadSavedLocation = async () => {

    try {

      const data =
        await getCurrentLocation()

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

        })

        setLastUpdated(
          data.updated_at || null
        )

        setSharing(true)

      }

    } catch (err) {

      console.log(
        'No saved location:',
        err.response?.data ||
          err.message
      )

    }

  }


  // ==========================================================
  // GET CONTACTS
  // ==========================================================

  const loadContacts = async () => {

    try {

      const data =
        await getGuardianUsers()

      setContacts(
        Array.isArray(data)
          ? data
          : data?.results || []
      )

    } catch (err) {

      console.error(
        'Failed to load contacts:',
        err
      )

      setContacts([])

    }

  }


  // ==========================================================
  // GET SAFETY ZONES
  // ==========================================================

  const loadZones = async () => {

    try {

      const data =
        await getGeofences()

      setZones(
        Array.isArray(data)
          ? data
          : data?.results || []
      )

    } catch (err) {

      console.error(
        'Failed to load safety zones:',
        err
      )

      setZones([])

    }

  }


  // ==========================================================
  // SEND LOCATION TO BACKEND
  // ==========================================================

  const sendLocation = async (
    latitude,
    longitude,
    accuracy = null
  ) => {

    try {

      const data =
        await updateCurrentLocation(
          latitude,
          longitude
        )

      setLocation({

        latitude:
          Number(latitude),

        longitude:
          Number(longitude),

        accuracy:
          data.accuracy !== undefined &&
          data.accuracy !== null
            ? Number(data.accuracy)
            : accuracy,

      })

      setLastUpdated(
        data.updated_at ||
          new Date().toISOString()
      )

      setSharing(true)

      setError('')

    } catch (err) {

      console.error(
        'Failed to update location:',
        err.response?.data ||
          err.message
      )

      if (
        err.response?.status === 401
      ) {

        setError(
          'Your session has expired. Please login again.'
        )

      } else {

        setError(
          'Unable to update your location.'
        )

      }

    }

  }


  // ==========================================================
  // GET BROWSER GPS
  // ==========================================================

  const getBrowserLocation = () => {

    return new Promise(
      (resolve, reject) => {

        if (
          !navigator.geolocation
        ) {

          reject(
            new Error(
              'Geolocation is not supported by this browser.'
            )
          )

          return
        }


        navigator.geolocation.getCurrentPosition(

          (position) => {

            resolve({
              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,

              accuracy:
                position.coords.accuracy,
            })

          },

          (geoError) => {

            reject(
              geoError
            )

          },

          {
            enableHighAccuracy:
              true,

            timeout:
              15000,

            maximumAge:
              5000,
          }

        )

      }
    )

  }


  // ==========================================================
  // START LOCATION
  // ==========================================================

  useEffect(() => {

    let watchId = null

    const startLocationSharing =
      async () => {

        setLoading(true)

        await Promise.allSettled([
          loadSavedLocation(),
          loadContacts(),
          loadZones(),
        ])


        if (
          !navigator.geolocation
        ) {

          setLoading(false)

          setError(
            'Geolocation is not supported by your browser.'
          )

          return

        }


        // Initial position

        try {

          const position =
            await getBrowserLocation()

          setLocation({

            latitude:
              position.latitude,

            longitude:
              position.longitude,

            accuracy:
              position.accuracy,

          })

          setLastUpdated(
            new Date().toISOString()
          )

          setSharing(true)

          await sendLocation(
            position.latitude,
            position.longitude,
            position.accuracy
          )

        } catch (geoError) {

          console.error(
            'Initial GPS error:',
            geoError
          )

          setSharing(false)

          switch (
            geoError.code
          ) {

            case 1:

              setError(
                'Location permission was denied. Please allow location access in your browser.'
              )

              break

            case 2:

              setError(
                'Your location could not be determined.'
              )

              break

            case 3:

              setError(
                'Location request timed out.'
              )

              break

            default:

              setError(
                'Unable to access your location.'
              )

          }

        }


        // Continuous location tracking

        watchId =
          navigator.geolocation.watchPosition(

            async (position) => {

              const {
                latitude,
                longitude,
                accuracy,
              } = position.coords


              setLocation({

                latitude,
                longitude,
                accuracy,

              })

              setLastUpdated(
                new Date().toISOString()
              )

              setSharing(true)

              setError('')


              await sendLocation(
                latitude,
                longitude,
                accuracy
              )

            },

            (geoError) => {

              console.error(
                'Watch location error:',
                geoError
              )

            },

            {
              enableHighAccuracy:
                true,

              maximumAge:
                5000,

              timeout:
                15000,
            }

          )


        setLoading(false)

      }


    startLocationSharing()


    return () => {

      if (
        watchId !== null
      ) {

        navigator.geolocation.clearWatch(
          watchId
        )

      }

    }

  }, [])


  // ==========================================================
  // MANUAL REFRESH
  // ==========================================================

  const refreshLocation = async () => {

    try {

      setRefreshing(true)

      const position =
        await getBrowserLocation()

      await sendLocation(
        position.latitude,
        position.longitude,
        position.accuracy
      )

    } catch (err) {

      console.error(
        'Manual location refresh error:',
        err
      )

      Swal.fire({

        title:
          'Unable to Get Location',

        text:
          'Please make sure browser location permission is enabled.',

        icon:
          'warning',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',

      })

    } finally {

      setRefreshing(false)

    }

  }


  // ==========================================================
  // FIND CURRENT SAFE ZONE
  // ==========================================================

  const safetyStatus =
    useMemo(() => {

      if (
        !location ||
        zones.length === 0
      ) {

        return {

          inside:
            false,

          zone:
            null,

          distance:
            null,

        }

      }


      let nearestZone =
        null

      let nearestDistance =
        Infinity


      for (
        const zone
        of zones
      ) {

        const lat =
          Number(
            zone.latitude
          )

        const lng =
          Number(
            zone.longitude
          )

        const radius =
          Number(
            zone.radius
          )


        if (
          !Number.isFinite(
            lat
          ) ||
          !Number.isFinite(
            lng
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

            lat,
            lng

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

          inside:
            false,

          zone:
            null,

          distance:
            null,

        }

      }


      return {

        inside:
          nearestDistance <=
          Number(
            nearestZone.radius
          ),

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
  // TIME
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
        hour:
          '2-digit',

        minute:
          '2-digit',

        second:
          '2-digit',
      }
    )

  }


  // ==========================================================
  // COORDINATE
  // ==========================================================

  const formatCoordinate = (
    value
  ) => {

    if (
      value === null ||
      value === undefined
    ) {

      return '--'

    }


    return Number(
      value
    ).toFixed(6)

  }


  // ==========================================================
  // MAP CENTER
  // ==========================================================

  const defaultCenter = [
    20.2961,
    85.8245,
  ]


  const mapCenter =
    location
      ? [
          location.latitude,
          location.longitude,
        ]
      : defaultCenter


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <DashboardLayout
      title="Live Location"
      subtitle="Your location is monitored in real time."
    >

      <div className="row g-4">


        {/* ====================================================
            MAP
        ==================================================== */}

        <div className="col-lg-8">

          <div
            className="position-relative"
            style={{
              height:
                '560px',

              overflow:
                'hidden',

              borderRadius:
                '20px',

              border:
                '1px solid var(--border-soft)',

              background:
                'var(--bg-elevated)',
            }}
          >

            {location ? (

              <MapContainer
                center={
                  mapCenter
                }
                zoom={16}
                scrollWheelZoom={
                  true
                }
                style={{
                  width:
                    '100%',

                  height:
                    '100%',

                  zIndex:
                    1,
                }}
              >

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                <MapCenter
                  latitude={
                    location.latitude
                  }
                  longitude={
                    location.longitude
                  }
                />


                {/* User accuracy */}

                <Circle
                  center={[
                    location.latitude,
                    location.longitude,
                  ]}
                  radius={
                    location.accuracy ||
                    50
                  }
                  pathOptions={{
                    color:
                      '#26e0c9',

                    fillColor:
                      '#26e0c9',

                    fillOpacity:
                      0.12,

                    weight:
                      2,
                  }}
                />


                {/* Safe zones */}

                {zones.map(
                  (zone) => {

                    const lat =
                      Number(
                        zone.latitude
                      )

                    const lng =
                      Number(
                        zone.longitude
                      )

                    const radius =
                      Number(
                        zone.radius
                      )


                    if (
                      !Number.isFinite(
                        lat
                      ) ||
                      !Number.isFinite(
                        lng
                      ) ||
                      !Number.isFinite(
                        radius
                      )
                    ) {

                      return null

                    }


                    const distance =
                      calculateDistance(

                        location.latitude,
                        location.longitude,

                        lat,
                        lng

                      )


                    const inside =
                      distance <=
                      radius


                    return (

                      <Circle
                        key={
                          zone.id
                        }
                        center={[
                          lat,
                          lng,
                        ]}
                        radius={
                          radius
                        }
                        pathOptions={{
                          color:
                            inside
                              ? '#26e0c9'
                              : '#8b96aa',

                          fillColor:
                            inside
                              ? '#26e0c9'
                              : '#8b96aa',

                          fillOpacity:
                            inside
                              ? 0.10
                              : 0.05,

                          weight:
                            2,
                        }}
                      />

                    )

                  }
                )}


                {/* Current position */}

                <CircleMarker
                  center={[
                    location.latitude,
                    location.longitude,
                  ]}
                  radius={12}
                  pathOptions={{
                    color:
                      '#ffffff',

                    fillColor:
                      '#26e0c9',

                    fillOpacity:
                      1,

                    weight:
                      4,
                  }}
                />

              </MapContainer>

            ) : (

              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  height:
                    '100%',

                  background:
                    'radial-gradient(circle at center, rgba(38,224,201,0.12), transparent 60%)',
                }}
              >

                <div
                  className="text-center"
                  style={{
                    color:
                      '#ffffff',
                  }}
                >

                  <FiMapPin
                    size={45}
                    className="mb-3"
                    style={{
                      color:
                        '#ff4d5e',
                    }}
                  />

                  <div>
                    {loading
                      ? 'Getting your location...'
                      : 'Location unavailable'}
                  </div>

                </div>

              </div>

            )}


            {/* ==================================================
                LOCATION CARD
            ================================================== */}

            <div
              className="position-absolute p-3"
              style={{
                top:
                  20,

                left:
                  20,

                minWidth:
                  285,

                zIndex:
                  1000,

                background:
                  'rgba(8,16,29,0.96)',

                border:
                  '1px solid rgba(38,224,201,0.40)',

                borderRadius:
                  '18px',

                boxShadow:
                  '0 15px 40px rgba(0,0,0,0.45)',

                backdropFilter:
                  'blur(15px)',

                color:
                  '#ffffff',
              }}
            >

              <div
                className="mb-3"
                style={{
                  color:
                    '#26e0c9',

                  fontSize:
                    '0.78rem',

                  fontWeight:
                    '700',

                  letterSpacing:
                    '3px',
                }}
              >
                CURRENT LOCATION
              </div>


              {loading && (

                <div
                  style={{
                    color:
                      '#aebbd0',

                    fontSize:
                      '0.85rem',
                  }}
                >
                  Getting your GPS location...
                </div>

              )}


              {!loading &&
                location && (

                <div
                  style={{
                    fontFamily:
                      'monospace',

                    fontSize:
                      '0.84rem',
                  }}
                >

                  <div
                    className="d-flex justify-content-between py-2"
                    style={{
                      borderBottom:
                        '1px solid rgba(255,255,255,0.08)',
                    }}
                  >

                    <span
                      style={{
                        color:
                          '#91a1b8',
                      }}
                    >
                      Latitude
                    </span>

                    <span
                      style={{
                        color:
                          '#ffffff',

                        fontWeight:
                          '700',
                      }}
                    >
                      {formatCoordinate(
                        location.latitude
                      )}
                    </span>

                  </div>


                  <div
                    className="d-flex justify-content-between py-2"
                    style={{
                      borderBottom:
                        '1px solid rgba(255,255,255,0.08)',
                    }}
                  >

                    <span
                      style={{
                        color:
                          '#91a1b8',
                      }}
                    >
                      Longitude
                    </span>

                    <span
                      style={{
                        color:
                          '#ffffff',

                        fontWeight:
                          '700',
                      }}
                    >
                      {formatCoordinate(
                        location.longitude
                      )}
                    </span>

                  </div>


                  <div
                    className="d-flex justify-content-between py-2"
                    style={{
                      borderBottom:
                        '1px solid rgba(255,255,255,0.08)',
                    }}
                  >

                    <span
                      style={{
                        color:
                          '#91a1b8',
                      }}
                    >
                      Accuracy
                    </span>

                    <span
                      style={{
                        color:
                          '#26e0c9',

                        fontWeight:
                          '700',
                      }}
                    >
                      {location.accuracy
                        ? `${Math.round(
                            location.accuracy
                          )} m`
                        : 'N/A'}
                    </span>

                  </div>


                  <div
                    className="d-flex justify-content-between py-2"
                  >

                    <span
                      style={{
                        color:
                          '#91a1b8',
                      }}
                    >
                      Updated
                    </span>

                    <span
                      style={{
                        color:
                          '#ffffff',

                        fontWeight:
                          '700',
                      }}
                    >
                      {formatTime(
                        lastUpdated
                      )}
                    </span>

                  </div>

                </div>

              )}


              {!loading &&
                !location && (

                <div
                  style={{
                    color:
                      '#ff5c6c',

                    fontSize:
                      '0.85rem',
                  }}
                >
                  {error ||
                    'Location unavailable'}
                </div>

              )}

            </div>


            {/* ==================================================
                SHARING BADGE
            ================================================== */}

            <div
              className="position-absolute d-flex align-items-center gap-2 px-3 py-2"
              style={{
                top:
                  20,

                right:
                  20,

                zIndex:
                  1000,

                background:
                  'rgba(8,16,29,0.94)',

                border:
                  `1px solid ${
                    sharing
                      ? 'rgba(38,224,201,0.35)'
                      : 'rgba(255,77,94,0.35)'
                  }`,

                borderRadius:
                  '22px',

                color:
                  '#ffffff',

                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.35)',

                backdropFilter:
                  'blur(12px)',

                fontSize:
                  '0.78rem',

                fontWeight:
                  '600',
              }}
            >

              <span
                style={{
                  width:
                    9,

                  height:
                    9,

                  borderRadius:
                    '50%',

                  display:
                    'inline-block',

                  background:
                    sharing
                      ? '#26e0c9'
                      : '#ff4d5e',

                  boxShadow:
                    sharing
                      ? '0 0 10px #26e0c9'
                      : '0 0 10px #ff4d5e',
                }}
              />

              {sharing
                ? 'Location Sharing Active'
                : 'Location Sharing Off'}

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

              <div
                className="position-absolute d-flex align-items-center gap-2 px-3 py-2"
                style={{
                  bottom:
                    20,

                  left:
                    '50%',

                  transform:
                    'translateX(-50%)',

                  zIndex:
                    1000,

                  minWidth:
                    '60%',

                  background:
                    'rgba(15,20,32,0.95)',

                  border:
                    '1px solid rgba(255,77,94,0.35)',

                  borderRadius:
                    '14px',

                  color:
                    '#ff5c6c',

                  fontSize:
                    '0.82rem',

                  justifyContent:
                    'center',

                  textAlign:
                    'center',

                  backdropFilter:
                    'blur(10px)',
                }}
              >

                <FiAlertTriangle />

                {error}

              </div>

            )}

          </div>

        </div>


        {/* ====================================================
            RIGHT COLUMN
        ==================================================== */}

        <div className="col-lg-4">


          {/* ==================================================
              SAFETY STATUS
          ================================================== */}

          <div
            className="glass glass-card mb-4"
          >

            <h6
              className="mb-3 d-flex align-items-center gap-2"
            >

              <FiTarget
                className="text-accent"
              />

              Safety Status

            </h6>


            <div
              className="d-flex align-items-center justify-content-between py-3"
              style={{
                borderBottom:
                  '1px solid var(--border-soft)',
              }}
            >

              <span
                className="text-muted-swu"
                style={{
                  fontSize:
                    '0.84rem',
                }}
              >
                Location Sharing
              </span>

              <span
                className="d-flex align-items-center gap-2"
                style={{
                  fontSize:
                    '0.78rem',
                }}
              >

                <span
                  className={
                    sharing
                      ? 'status-dot on'
                      : 'status-dot off'
                  }
                />

                {sharing
                  ? 'Active'
                  : 'Off'}

              </span>

            </div>


            <div
              className="d-flex align-items-center justify-content-between py-3"
              style={{
                borderBottom:
                  '1px solid var(--border-soft)',
              }}
            >

              <span
                className="text-muted-swu"
                style={{
                  fontSize:
                    '0.84rem',
                }}
              >
                Safe Zone
              </span>

              <span
                className="d-flex align-items-center gap-2"
                style={{
                  fontSize:
                    '0.78rem',
                }}
              >

                <span
                  className={
                    safetyStatus.inside
                      ? 'status-dot on'
                      : safetyStatus.zone
                        ? 'status-dot danger'
                        : 'status-dot off'
                  }
                />

                {safetyStatus.inside
                  ? 'Inside'
                  : safetyStatus.zone
                    ? 'Outside'
                    : 'Not Set'}

              </span>

            </div>


            <div
              className="d-flex align-items-center justify-content-between py-3"
            >

              <span
                className="text-muted-swu"
                style={{
                  fontSize:
                    '0.84rem',
                }}
              >
                Trusted Contacts
              </span>

              <span
                className="font-mono"
                style={{
                  fontSize:
                    '0.8rem',
                }}
              >
                {contacts.length}
              </span>

            </div>

          </div>


          {/* ==================================================
              SAFETY ZONE
          ================================================== */}

          <div
            className="glass glass-card mb-4"
          >

            <h6
              className="mb-3 d-flex align-items-center gap-2"
            >

              {safetyStatus.inside ? (

                <FiCheckCircle
                  className="text-accent"
                />

              ) : (

                <FiShield
                  className="text-accent"
                />

              )}

              Current Safe Zone

            </h6>


            {safetyStatus.zone ? (

              <>

                <div
                  className="d-flex align-items-center gap-2 mb-3"
                >

                  <span
                    className={
                      safetyStatus.inside
                        ? 'status-dot on'
                        : 'status-dot danger'
                    }
                  />

                  <span
                    className={
                      safetyStatus.inside
                        ? 'text-accent'
                        : 'text-danger-swu'
                    }
                    style={{
                      fontWeight:
                        600,

                      fontSize:
                        '0.85rem',
                    }}
                  >

                    {safetyStatus.inside
                      ? 'You are inside this zone'
                      : 'You are outside this zone'}

                  </span>

                </div>


                <div className="glass p-3">

                  <div
                    className="fw-semibold mb-1"
                  >
                    {safetyStatus.zone.name}
                  </div>

                  <div
                    className="text-muted-swu"
                    style={{
                      fontSize:
                        '0.73rem',
                    }}
                  >
                    Radius:{' '}
                    {safetyStatus.zone.radius}
                    {' '}m
                  </div>

                  <div
                    className="font-mono text-accent mt-2"
                    style={{
                      fontSize:
                        '0.76rem',
                    }}
                  >

                    {Math.round(
                      safetyStatus.distance
                    )} m from center

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

                No safety zones have been configured.

              </div>

            )}

          </div>


          {/* ==================================================
              SHARING WITH
          ================================================== */}

          <div
            className="glass glass-card"
          >

            <h6
              className="mb-3 d-flex align-items-center gap-2"
            >

              <FiUsers
                className="text-accent"
              />

              Sharing With

            </h6>


            {contacts.length === 0 ? (

              <div
                className="text-muted-swu"
                style={{
                  fontSize:
                    '0.8rem',
                }}
              >
                No trusted contacts.
              </div>

            ) : (

              contacts
                .slice(0, 5)
                .map(
                  (contact) => (

                    <div
                      key={
                        contact.id ||
                        contact.user
                      }
                      className="d-flex align-items-center justify-content-between py-2"
                      style={{
                        borderBottom:
                          '1px solid var(--border-soft)',

                        fontSize:
                          '0.84rem',
                      }}
                    >

                      <div>

                        <div>
                          {contact.name ||
                            contact.username ||
                            'Trusted Contact'}
                        </div>

                        <div
                          className="text-faint-swu"
                          style={{
                            fontSize:
                              '0.68rem',
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

                  )
                )

            )}

          </div>

        </div>


        {/* ====================================================
            BOTTOM SECTION
        ==================================================== */}

        <div className="col-12">

          <div
            className="glass glass-card"
          >

            <div
              className="d-flex align-items-center justify-content-between mb-3"
            >

              <h6
                className="mb-0 d-flex align-items-center gap-2"
              >

                <FiClock
                  className="text-accent"
                />

                Location Information

              </h6>


              <button
                type="button"
                className="btn btn-sm btn-swu-ghost d-flex align-items-center gap-2"
                onClick={
                  refreshLocation
                }
                disabled={
                  refreshing
                }
              >

                <FiRefreshCw
                  size={13}
                />

                {refreshing
                  ? 'Updating...'
                  : 'Update Now'}

              </button>

            </div>


            <div className="row g-4">

              <div className="col-md-3">

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

                  {formatCoordinate(
                    location?.latitude
                  )}

                </div>

              </div>


              <div className="col-md-3">

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

                  {formatCoordinate(
                    location?.longitude
                  )}

                </div>

              </div>


              <div className="col-md-3">

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

                  {location?.accuracy
                    ? `${Math.round(
                        location.accuracy
                      )} m`
                    : 'N/A'}

                </div>

              </div>


              <div className="col-md-3">

                <div
                  className="text-muted-swu"
                  style={{
                    fontSize:
                      '0.72rem',
                  }}
                >
                  Last Updated
                </div>

                <div className="font-mono">

                  {formatTime(
                    lastUpdated
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  )
}