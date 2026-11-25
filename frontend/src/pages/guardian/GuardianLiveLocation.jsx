import React, { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from 'react-leaflet'

import {
  FiMapPin,
  FiUsers,
  FiUser,
  FiShield,
  FiClock,
  FiRefreshCw,
  FiAlertTriangle,
} from 'react-icons/fi'

import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import {
  getProtectedUsers,
  getProtectedUserLocation,
} from '../../services/guardianService.js'

import 'leaflet/dist/leaflet.css'


// ==========================================================
// MAP CENTER
// ==========================================================

function MapCenter({ latitude, longitude }) {

  const map = useMap()

  useEffect(() => {

    if (
      latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined
    ) {

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

    }

  }, [
    latitude,
    longitude,
    map,
  ])

  return null
}


// ==========================================================
// GUARDIAN LIVE LOCATION
// ==========================================================

export default function GuardianLiveLocation() {

  const [users, setUsers] = useState([])

  const [selectedUserId, setSelectedUserId] =
    useState('')

  const [location, setLocation] =
    useState(null)

  const [selectedUser, setSelectedUser] =
    useState(null)

  const [loadingUsers, setLoadingUsers] =
    useState(true)

  const [loadingLocation, setLoadingLocation] =
    useState(false)

  const [error, setError] =
    useState('')

  const [lastUpdated, setLastUpdated] =
    useState(null)

  const locationRequestRef = useRef(0)


  // ==========================================================
  // LOAD PROTECTED USERS
  // ==========================================================

  const loadProtectedUsers = async () => {

    try {

      setLoadingUsers(true)

      setError('')

      const data =
        await getProtectedUsers()

      const protectedUsers =
        Array.isArray(data)
          ? data
          : data?.results || []

      setUsers(protectedUsers)


      if (protectedUsers.length > 0) {

        const firstUser =
          protectedUsers[0]

        const firstUserId =
          firstUser.user ||
          firstUser.id

        setSelectedUserId(
          String(firstUserId)
        )

        setSelectedUser(
          firstUser
        )

      }

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
  // LOAD SELECTED USER LOCATION
  // ==========================================================

  const loadLocation = async (
    userId = selectedUserId
  ) => {

    const requestId = ++locationRequestRef.current

    if (!userId) {

      setLocation(null)

      return

    }


    try {

      setLoadingLocation(true)

      setError('')


      const data =
        await getProtectedUserLocation(
          userId
        )


      // DRF may return the object directly, inside `location`,
      // or as a single-item `results` response.
      const rawLocation =
        data?.location ||
        (Array.isArray(data?.results)
          ? data.results[0]
          : data)

      const latitude = Number(rawLocation?.latitude)
      const longitude = Number(rawLocation?.longitude)

      const hasValidCoordinates =
        rawLocation &&
        rawLocation.latitude !== null &&
        rawLocation.latitude !== undefined &&
        rawLocation.latitude !== '' &&
        rawLocation.longitude !== null &&
        rawLocation.longitude !== undefined &&
        rawLocation.longitude !== '' &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180

      if (requestId !== locationRequestRef.current) {
        return
      }

      if (hasValidCoordinates) {
        const accuracy =
          rawLocation.accuracy !== null &&
          rawLocation.accuracy !== undefined &&
          rawLocation.accuracy !== '' &&
          Number.isFinite(Number(rawLocation.accuracy))
            ? Number(rawLocation.accuracy)
            : null

        const updatedAt =
          rawLocation.updated_at ||
          rawLocation.created_at ||
          new Date().toISOString()

        setLocation({
          latitude,
          longitude,
          accuracy,
          updated_at: updatedAt,
        })

        setLastUpdated(updatedAt)
      } else {
        setLocation(null)
        setLastUpdated(null)
      }

    } catch (err) {

      console.error(
        'Failed to load protected user location:',
        err
      )

      if (
        err.response?.status === 403
      ) {

        setError(
          'You are not authorized to view this user location.'
        )

      } else if (
        err.response?.status === 404
      ) {

        setError(
          'No location has been shared by this user yet.'
        )

      } else {

        setError(
          err.response?.data?.detail ||
          'Unable to load user location.'
        )

      }

      setLocation(null)

    } finally {

      setLoadingLocation(false)

    }

  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadProtectedUsers()

  }, [])


  // ==========================================================
  // LOAD LOCATION WHEN USER CHANGES
  // ==========================================================

  useEffect(() => {

    if (
      selectedUserId
    ) {

      const user =
        users.find(
          (item) =>
            String(
              item.user ||
              item.id
            ) === String(
              selectedUserId
            )
        )

      if (user) {

        setSelectedUser(
          user
        )

      }

      loadLocation(
        selectedUserId
      )

    }

  }, [
    selectedUserId,
    users,
  ])


  // ==========================================================
  // AUTO REFRESH LOCATION
  // ==========================================================

  useEffect(() => {

    if (!selectedUserId) {
      return
    }


    const interval =
      setInterval(() => {

        loadLocation(
          selectedUserId
        )

      }, 10000)


    return () => {

      clearInterval(
        interval
      )

    }

  }, [
    selectedUserId,
  ])


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (value) => {

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


    return date.toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )

  }


  // ==========================================================
  // FORMAT COORDINATE
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
  // DEFAULT MAP CENTER
  // ==========================================================

  const mapCenter =
    location
      ? [
          location.latitude,
          location.longitude,
        ]
      : [
          20.2961,
          85.8245,
        ]


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <DashboardLayout
      title="Live Location"
      subtitle="Monitor the live location of your protected users."
    >

      {/* ======================================================
          USER SELECTOR
      ====================================================== */}

      <div
        className="glass glass-card mb-4"
      >

        <div
          className="d-flex flex-wrap justify-content-between align-items-center gap-3"
        >

          <div>

            <h6
              className="mb-1 d-flex align-items-center gap-2"
            >

              <FiUsers
                className="text-accent"
              />

              Protected User

            </h6>

            <div
              className="text-muted-swu"
              style={{
                fontSize: '0.74rem',
              }}
            >
              Select a user to view their current shared location.
            </div>

          </div>


          <div
            className="d-flex align-items-center gap-2"
          >

            <select
              className="form-select form-control-swu"
              value={selectedUserId}
              onChange={(e) => {

                setSelectedUserId(
                  e.target.value
                )

              }}
              disabled={
                loadingUsers ||
                users.length === 0
              }
              style={{
                minWidth: 240,
              }}
            >

              {users.length === 0 ? (

                <option value="">
                  No protected users
                </option>

              ) : (

                users.map(
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
                )

              )}

            </select>


            <button
              type="button"
              className="btn btn-swu-ghost d-flex align-items-center gap-2"
              onClick={() =>
                loadLocation(
                  selectedUserId
                )
              }
              disabled={
                loadingLocation ||
                !selectedUserId
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
          ERROR
      ====================================================== */}

      {error && (

        <div
          className="glass glass-card mb-4"
          style={{
            border:
              '1px solid rgba(255,77,94,0.35)',
          }}
        >

          <div
            className="d-flex align-items-center gap-2 text-danger-swu"
            style={{
              fontSize: '0.82rem',
            }}
          >

            <FiAlertTriangle />

            {error}

          </div>

        </div>

      )}


      {/* ======================================================
          NO PROTECTED USERS
      ====================================================== */}

      {!loadingUsers &&
        users.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >

          <FiUsers
            size={45}
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


      {/* ======================================================
          MAP + LOCATION DETAILS
      ====================================================== */}

      {users.length > 0 && (

        <div className="row g-4">


          {/* ==================================================
              MAP
          ================================================== */}

          <div className="col-lg-8">

            <div
              className="position-relative"
              style={{
                height: 550,
                overflow: 'hidden',
                borderRadius: 20,
                border:
                  '1px solid var(--border-soft)',
                background:
                  'var(--bg-elevated)',
              }}
            >

              {location ? (

                <MapContainer
                  key={`${selectedUserId}-${location.latitude}-${location.longitude}`}
                  center={
                    mapCenter
                  }
                  zoom={16}
                  scrollWheelZoom={true}
                  style={{
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
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


                  {/* Accuracy Circle */}

                  <Circle
                    center={[
                      location.latitude,
                      location.longitude,
                    ]}
                    radius={
                      Number.isFinite(location.accuracy) &&
                      location.accuracy > 0
                        ? location.accuracy
                        : 50
                    }
                    pathOptions={{
                      color:
                        '#26e0c9',
                      fillColor:
                        '#26e0c9',
                      fillOpacity:
                        0.12,
                      weight: 2,
                    }}
                  />


                  {/* Outer Radius */}

                  <Circle
                    center={[
                      location.latitude,
                      location.longitude,
                    ]}
                    radius={150}
                    pathOptions={{
                      color:
                        '#26e0c9',
                      fillOpacity:
                        0,
                      fillColor:
                        'transparent',
                      weight: 1,
                      opacity: 0.4,
                    }}
                  />


                  {/* User Location */}

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
                      weight: 4,
                    }}
                  >

                    <Popup>

                      <strong>
                        {selectedUser?.user_name ||
                          selectedUser?.username ||
                          selectedUser?.name ||
                          'Protected User'}
                      </strong>

                      <br />

                      Latitude:{' '}
                      {formatCoordinate(
                        location.latitude
                      )}

                      <br />

                      Longitude:{' '}
                      {formatCoordinate(
                        location.longitude
                      )}

                      <br />

                      Updated:{' '}
                      {formatTime(
                        location.updated_at
                      )}

                    </Popup>

                  </CircleMarker>

                </MapContainer>

              ) : (

                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    height: '100%',
                    background:
                      'radial-gradient(circle at center, rgba(38,224,201,0.12), transparent 60%)',
                  }}
                >

                  <div
                    className="text-center"
                  >

                    <FiMapPin
                      size={46}
                      className="text-accent mb-3"
                    />

                    <div
                      style={{
                        fontSize: '0.86rem',
                      }}
                    >

                      {loadingLocation
                        ? 'Loading user location...'
                        : 'Location not available'}

                    </div>

                  </div>

                </div>

              )}


              {/* LIVE BADGE */}

              <div
                className="position-absolute d-flex align-items-center gap-2 px-3 py-2"
                style={{
                  top: 20,
                  right: 20,
                  zIndex: 1000,

                  background:
                    'rgba(8,16,29,0.95)',

                  border:
                    '1px solid rgba(38,224,201,0.35)',

                  borderRadius: 22,

                  color:
                    '#ffffff',

                  fontSize:
                    '0.76rem',

                  fontWeight: 600,

                  backdropFilter:
                    'blur(12px)',
                }}
              >

                <span
                  className="status-dot on"
                />

                Live Monitoring

              </div>

            </div>

          </div>


          {/* ==================================================
              LOCATION DETAILS
          ================================================== */}

          <div className="col-lg-4">

            <div
              className="glass glass-card mb-4"
            >

              <h6
                className="mb-3 d-flex align-items-center gap-2"
              >

                <FiShield
                  className="text-accent"
                />

                Location Details

              </h6>


              <div
                className="glass p-3 mb-3"
              >

                <div
                  className="d-flex align-items-center gap-2 mb-2"
                >

                  <FiUser
                    className="text-accent"
                  />

                  <span
                    className="fw-semibold"
                  >
                    {selectedUser?.user_name ||
                      selectedUser?.username ||
                      selectedUser?.name ||
                      'Protected User'}
                  </span>

                </div>


                <div
                  className="text-muted-swu"
                  style={{
                    fontSize:
                      '0.72rem',
                  }}
                >

                  Guardian relationship:

                  {' '}

                  {selectedUser?.relationship ||
                    'Trusted User'}

                </div>

              </div>


              {location ? (

                <div
                  className="font-mono"
                  style={{
                    fontSize:
                      '0.82rem',
                  }}
                >

                  {/* Latitude */}

                  <div
                    className="d-flex justify-content-between py-3"
                    style={{
                      borderBottom:
                        '1px solid var(--border-soft)',
                    }}
                  >

                    <span
                      className="text-muted-swu"
                    >
                      Latitude
                    </span>

                    <span>
                      {formatCoordinate(
                        location.latitude
                      )}
                    </span>

                  </div>


                  {/* Longitude */}

                  <div
                    className="d-flex justify-content-between py-3"
                    style={{
                      borderBottom:
                        '1px solid var(--border-soft)',
                    }}
                  >

                    <span
                      className="text-muted-swu"
                    >
                      Longitude
                    </span>

                    <span>
                      {formatCoordinate(
                        location.longitude
                      )}
                    </span>

                  </div>


                  {/* Accuracy */}

                  <div
                    className="d-flex justify-content-between py-3"
                    style={{
                      borderBottom:
                        '1px solid var(--border-soft)',
                    }}
                  >

                    <span
                      className="text-muted-swu"
                    >
                      Accuracy
                    </span>

                    <span
                      className="text-accent"
                    >

                      {location.accuracy
                        ? `${Math.round(
                            location.accuracy
                          )} m`
                        : 'N/A'}

                    </span>

                  </div>


                  {/* Updated */}

                  <div
                    className="d-flex justify-content-between py-3"
                  >

                    <span
                      className="text-muted-swu"
                    >
                      Last Updated
                    </span>

                    <span>
                      {formatTime(
                        lastUpdated
                      )}
                    </span>

                  </div>

                </div>

              ) : (

                <div
                  className="text-muted-swu text-center py-4"
                  style={{
                    fontSize:
                      '0.82rem',
                  }}
                >

                  No location data available.

                </div>

              )}

            </div>


            {/* SHARING STATUS */}

            <div
              className="glass glass-card"
            >

              <h6
                className="mb-3 d-flex align-items-center gap-2"
              >

                <FiClock
                  className="text-accent"
                />

                Sharing Status

              </h6>


              <div
                className="d-flex align-items-center justify-content-between"
              >

                <span
                  className="text-muted-swu"
                  style={{
                    fontSize:
                      '0.82rem',
                  }}
                >
                  Location Sharing
                </span>

                <span
                  className="d-flex align-items-center gap-2"
                  style={{
                    fontSize:
                      '0.8rem',
                  }}
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

            </div>

          </div>

        </div>

      )}

    </DashboardLayout>

  )
}