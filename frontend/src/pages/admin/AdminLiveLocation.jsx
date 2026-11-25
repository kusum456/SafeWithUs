import React, { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from 'react-leaflet'

import {
  FiMapPin,
  FiRefreshCw,
  FiUsers,
  FiClock,
  FiShield,
} from 'react-icons/fi'

import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { getAllLocations } from '../../services/trackingService.js'

import 'leaflet/dist/leaflet.css'


// ============================================================
// ADMIN LIVE LOCATION
// ============================================================

export default function AdminLiveLocation() {

  const [locations, setLocations] = useState([])

  const [loading, setLoading] = useState(true)

  const [selectedUser, setSelectedUser] = useState(null)


  // ============================================================
  // LOAD ALL USER LOCATIONS
  // ============================================================

  const loadLocations = async () => {

    try {

      setLoading(true)

      const data =
        await getAllLocations()

      const locationData =
        Array.isArray(data)
          ? data
          : data?.results || []

      setLocations(locationData)

    } catch (error) {

      console.error(
        'Admin live location error:',
        error
      )

      Swal.fire({
        title: 'Unable to Load Locations',
        text:
          error.response?.data?.detail ||
          'Unable to load user locations.',
        icon: 'error',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })

    } finally {

      setLoading(false)

    }

  }


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadLocations()

  }, [])


  // ============================================================
  // LOCATION CENTER
  // ============================================================

  const mapCenter = useMemo(() => {

    if (locations.length > 0) {

      return [
        Number(locations[0].latitude),
        Number(locations[0].longitude),
      ]

    }

    // Default center
    // Bhubaneswar

    return [
      20.2961,
      85.8245,
    ]

  }, [locations])


  // ============================================================
  // USER NAME
  // ============================================================

  const getUserName = (location) => {

    return (
      location.username ||
      location.user_username ||
      location.user_name ||
      `User ${location.user}`
    )

  }


  // ============================================================
  // TIME FORMAT
  // ============================================================

  const formatTime = (date) => {

    if (!date) {

      return 'Unknown'

    }


    const parsed =
      new Date(date)


    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {

      return 'Unknown'

    }


    return parsed.toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )

  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <DashboardLayout
      title="Live Location Monitoring"
      subtitle="Monitor the current locations of SafeWithUs users."
    >

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >

        <div
          className="d-flex align-items-center gap-3"
        >

          <div
            className="glass px-3 py-2 d-flex align-items-center gap-2"
          >

            <FiUsers
              className="text-accent"
            />

            <span
              style={{
                fontSize: '0.82rem',
              }}
            >

              {locations.length}

              {' '}

              {locations.length === 1
                ? 'User'
                : 'Users'}

              {' '}tracked

            </span>

          </div>


          <div
            className="glass px-3 py-2 d-flex align-items-center gap-2"
          >

            <span
              className="status-dot on"
            />

            <span
              style={{
                fontSize: '0.82rem',
              }}
            >
              Location System Active
            </span>

          </div>

        </div>


        <button
          type="button"
          className="btn btn-swu-ghost d-flex align-items-center gap-2"
          onClick={loadLocations}
          disabled={loading}
        >

          <FiRefreshCw
            size={15}
          />

          {loading
            ? 'Refreshing...'
            : 'Refresh'}

        </button>

      </div>


      {/* ======================================================
          MAP + USER LIST
      ====================================================== */}

      <div className="row g-4">


        {/* ====================================================
            MAP
        ==================================================== */}

        <div className="col-lg-8">

          <div
            className="position-relative"
            style={{
              height: '560px',
              overflow: 'hidden',
              borderRadius: '20px',
              border:
                '1px solid var(--border-soft)',
              background:
                'var(--bg-elevated)',
            }}
          >

            {locations.length > 0 ? (

              <MapContainer
                center={mapCenter}
                zoom={13}
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


                {locations.map((location) => {

                  const latitude =
                    Number(
                      location.latitude
                    )

                  const longitude =
                    Number(
                      location.longitude
                    )


                  return (

                    <CircleMarker
                      key={location.id}
                      center={[
                        latitude,
                        longitude,
                      ]}
                      radius={10}
                      pathOptions={{
                        color: '#ffffff',
                        fillColor: '#26e0c9',
                        fillOpacity: 1,
                        weight: 3,
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedUser(
                            location
                          )
                        },
                      }}
                    >

                      <Popup>

                        <div
                          style={{
                            minWidth: 170,
                          }}
                        >

                          <strong>
                            {getUserName(
                              location
                            )}
                          </strong>

                          <br />

                          <span>
                            Latitude:{' '}
                            {latitude.toFixed(
                              6
                            )}
                          </span>

                          <br />

                          <span>
                            Longitude:{' '}
                            {longitude.toFixed(
                              6
                            )}
                          </span>

                          <br />

                          <small>
                            Updated:{' '}
                            {formatTime(
                              location.updated_at
                            )}
                          </small>

                        </div>

                      </Popup>

                    </CircleMarker>

                  )

                })}

              </MapContainer>

            ) : (

              <div
                className="d-flex flex-column align-items-center justify-content-center text-center"
                style={{
                  height: '100%',
                  color: '#ffffff',
                  background:
                    'radial-gradient(circle at center, rgba(38,224,201,0.12), transparent 60%)',
                }}
              >

                <FiMapPin
                  size={48}
                  className="mb-3"
                  style={{
                    color:
                      '#26e0c9',
                  }}
                />

                <h6>
                  No User Locations
                </h6>

                <p
                  className="text-muted-swu mb-0"
                  style={{
                    fontSize:
                      '0.8rem',
                  }}
                >
                  No users have submitted
                  location data yet.
                </p>

              </div>

            )}


            {/* Map overlay */}

            <div
              className="position-absolute px-3 py-2"
              style={{
                top: 20,
                left: 20,
                zIndex: 1000,

                background:
                  'rgba(8,16,29,0.94)',

                border:
                  '1px solid rgba(38,224,201,0.35)',

                borderRadius: 20,

                color: '#ffffff',

                fontSize: '0.76rem',

                fontWeight: 600,

                backdropFilter:
                  'blur(12px)',
              }}
            >

              <span
                className="status-dot on me-1"
              />

              Live User Locations

            </div>

          </div>

        </div>


        {/* ====================================================
            USER LOCATION LIST
        ==================================================== */}

        <div className="col-lg-4">

          <div
            className="glass glass-card"
            style={{
              minHeight: '560px',
            }}
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

                Users

              </h6>

              <span
                className="eyebrow"
              >
                LIVE
              </span>

            </div>


            {loading ? (

              <div
                className="text-center py-5 text-muted-swu"
              >

                <div
                  className="spinner-border mb-3"
                  style={{
                    color:
                      '#26e0c9',
                  }}
                />

                <div
                  style={{
                    fontSize:
                      '0.82rem',
                  }}
                >
                  Loading locations...
                </div>

              </div>

            ) : locations.length === 0 ? (

              <div
                className="text-center py-5"
              >

                <FiMapPin
                  size={32}
                  className="text-muted-swu mb-3"
                />

                <div
                  className="text-muted-swu"
                  style={{
                    fontSize:
                      '0.82rem',
                  }}
                >
                  No location data available.
                </div>

              </div>

            ) : (

              <div
                className="d-flex flex-column gap-2"
              >

                {locations.map((location) => {

                  const name =
                    getUserName(
                      location
                    )


                  const isSelected =
                    selectedUser?.id ===
                    location.id


                  return (

                    <button
                      key={location.id}
                      type="button"
                      onClick={() =>
                        setSelectedUser(
                          location
                        )
                      }
                      className="text-start"
                      style={{
                        width: '100%',
                        border:
                          isSelected
                            ? '1px solid rgba(38,224,201,0.55)'
                            : '1px solid var(--border-soft)',

                        background:
                          isSelected
                            ? 'rgba(38,224,201,0.08)'
                            : 'var(--surface)',

                        borderRadius:
                          '14px',

                        color:
                          'var(--text)',

                        padding:
                          '13px',

                        cursor:
                          'pointer',
                      }}
                    >

                      <div
                        className="d-flex align-items-center justify-content-between mb-2"
                      >

                        <div
                          className="d-flex align-items-center gap-2"
                        >

                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background:
                                'var(--surface-strong)',
                            }}
                          >

                            <FiUsers
                              size={15}
                              className="text-accent"
                            />

                          </div>


                          <div>

                            <div
                              style={{
                                fontSize:
                                  '0.84rem',
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
                              User ID:{' '}
                              {location.user}
                            </div>

                          </div>

                        </div>


                        <span
                          className="status-dot on"
                        />

                      </div>


                      <div
                        className="font-mono text-muted-swu"
                        style={{
                          fontSize:
                            '0.68rem',
                        }}
                      >

                        {Number(
                          location.latitude
                        ).toFixed(5)}

                        {' , '}

                        {Number(
                          location.longitude
                        ).toFixed(5)}

                      </div>


                      <div
                        className="d-flex align-items-center gap-1 text-faint-swu mt-2"
                        style={{
                          fontSize:
                            '0.65rem',
                        }}
                      >

                        <FiClock
                          size={11}
                        />

                        {formatTime(
                          location.updated_at
                        )}

                      </div>

                    </button>

                  )

                })}

              </div>

            )}

          </div>

        </div>

      </div>


      {/* ======================================================
          SELECTED USER DETAILS
      ====================================================== */}

      {selectedUser && (

        <div className="row g-4 mt-1">

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

                  <FiShield
                    className="text-accent"
                  />

                  Selected User Location

                </h6>

                <button
                  type="button"
                  className="btn btn-sm btn-swu-ghost"
                  onClick={() =>
                    setSelectedUser(
                      null
                    )
                  }
                >
                  Close
                </button>

              </div>


              <div className="row g-3">

                <div className="col-md-3">

                  <div
                    className="text-muted-swu"
                    style={{
                      fontSize:
                        '0.72rem',
                    }}
                  >
                    User
                  </div>

                  <div
                    className="fw-semibold"
                  >
                    {getUserName(
                      selectedUser
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
                    Latitude
                  </div>

                  <div className="font-mono">
                    {Number(
                      selectedUser.latitude
                    ).toFixed(6)}
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
                    {Number(
                      selectedUser.longitude
                    ).toFixed(6)}
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

                  <div
                    className="font-mono"
                  >
                    {formatTime(
                      selectedUser.updated_at
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </DashboardLayout>

  )
}