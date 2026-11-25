import React, { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet'

import {
  FiShield,
  FiMapPin,
  FiUsers,
  FiRefreshCw,
  FiSearch,
  FiClock,
} from 'react-icons/fi'

import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { getAllGeofences } from '../../services/geofence.js'

import 'leaflet/dist/leaflet.css'


// ============================================================
// MAP VIEW
// ============================================================

function MapView({ zones }) {

  const map = useMap()

  useEffect(() => {

    if (!zones.length) {
      return
    }

    const validZones = zones.filter(
      (zone) =>
        Number.isFinite(Number(zone.latitude)) &&
        Number.isFinite(Number(zone.longitude))
    )


    if (!validZones.length) {
      return
    }


    const bounds = validZones.map(
      (zone) => [
        Number(zone.latitude),
        Number(zone.longitude),
      ]
    )


    map.fitBounds(
      bounds,
      {
        padding: [40, 40],
        maxZoom: 15,
      }
    )

  }, [zones, map])


  return null
}


// ============================================================
// ADMIN SAFETY ZONES
// ============================================================

export default function AdminSafetyZones() {

  const [zones, setZones] = useState([])

  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')

  const [selectedZone, setSelectedZone] =
    useState(null)


  // ==========================================================
  // LOAD ALL ZONES
  // ==========================================================

  const loadZones = async () => {

    try {

      setLoading(true)

      const data =
        await getAllGeofences()

      setZones(
        Array.isArray(data)
          ? data
          : data?.results || []
      )

    } catch (error) {

      console.error(
        'Admin geofence error:',
        error
      )

      Swal.fire({
        title: 'Unable to Load Safety Zones',
        text:
          error.response?.data?.detail ||
          'Unable to load system safety zones.',
        icon: 'error',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {

    loadZones()

  }, [])


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredZones = useMemo(() => {

    const search =
      query.toLowerCase().trim()


    if (!search) {
      return zones
    }


    return zones.filter((zone) => {

      const zoneName =
        String(
          zone.name || ''
        ).toLowerCase()


      const username =
        String(
          zone.username ||
          zone.user_username ||
          zone.user_name ||
          zone.user ||
          ''
        ).toLowerCase()


      return (
        zoneName.includes(search) ||
        username.includes(search)
      )

    })

  }, [zones, query])


  // ==========================================================
  // TOTAL USERS
  // ==========================================================

  const uniqueUsers = useMemo(() => {

    return new Set(
      zones.map(
        (zone) =>
          zone.user
      )
    ).size

  }, [zones])


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (value) => {

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
  // DEFAULT MAP CENTER
  // ==========================================================

  const defaultCenter = [
    20.2961,
    85.8245,
  ]


  const firstValidZone =
    filteredZones.find(
      (zone) =>
        Number.isFinite(
          Number(zone.latitude)
        ) &&
        Number.isFinite(
          Number(zone.longitude)
        )
    )


  const mapCenter = firstValidZone
    ? [
        Number(
          firstValidZone.latitude
        ),
        Number(
          firstValidZone.longitude
        ),
      ]
    : defaultCenter


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <DashboardLayout
      title="Safety Zones"
      subtitle="Monitor safety zones configured across the SafeWithUs network."
    >

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="row g-4 mb-4">

        <div className="col-md-4">

          <div className="glass glass-card h-100">

            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.78rem',
              }}
            >
              Total Safety Zones
            </div>

            <div
              className="font-mono fw-bold text-accent"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {zones.length}
            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="glass glass-card h-100">

            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.78rem',
              }}
            >
              Users With Zones
            </div>

            <div
              className="font-mono fw-bold"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {uniqueUsers}
            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="glass glass-card h-100">

            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.78rem',
              }}
            >
              Monitoring
            </div>

            <div
              className="d-flex align-items-center gap-2 mt-2"
            >

              <span className="status-dot on" />

              <span
                style={{
                  fontSize: '0.85rem',
                }}
              >
                Geofencing Active
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          CONTROLS
      ====================================================== */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >

        <div
          className="position-relative"
          style={{
            minWidth: 250,
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
            placeholder="Search zone or user..."
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
          />

        </div>


        <button
          type="button"
          className="btn btn-swu-ghost d-flex align-items-center gap-2"
          onClick={loadZones}
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
          LOADING
      ====================================================== */}

      {loading && (

        <div
          className="glass glass-card text-center py-5"
        >

          <div
            className="spinner-border"
            style={{
              color: '#26e0c9',
            }}
            role="status"
          />

          <div
            className="text-muted-swu mt-3"
            style={{
              fontSize: '0.85rem',
            }}
          >
            Loading system safety zones...
          </div>

        </div>

      )}


      {/* ======================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        filteredZones.length === 0 && (

          <div
            className="glass glass-card text-center py-5"
          >

            <FiShield
              size={45}
              className="text-accent mb-3"
            />

            <h6 className="fw-bold">
              No Safety Zones
            </h6>

            <p
              className="text-muted-swu mb-0"
              style={{
                fontSize: '0.85rem',
              }}
            >
              {query
                ? 'No zones match your search.'
                : 'No safety zones have been created yet.'}
            </p>

          </div>

        )}


      {/* ======================================================
          MAP + LIST
      ====================================================== */}

      {!loading &&
        filteredZones.length > 0 && (

          <div className="row g-4">


            {/* ==================================================
                MAP
            ================================================== */}

            <div className="col-lg-7">

              <div
                className="position-relative"
                style={{
                  height: 560,
                  borderRadius: 20,
                  overflow: 'hidden',
                  border:
                    '1px solid var(--border-soft)',
                  background:
                    'var(--bg-elevated)',
                }}
              >

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


                  <MapView
                    zones={filteredZones}
                  />


                  {filteredZones.map((zone) => {

                    const latitude =
                      Number(
                        zone.latitude
                      )

                    const longitude =
                      Number(
                        zone.longitude
                      )


                    if (
                      !Number.isFinite(
                        latitude
                      ) ||
                      !Number.isFinite(
                        longitude
                      )
                    ) {
                      return null
                    }


                    return (

                      <React.Fragment
                        key={zone.id}
                      >

                        {/* Geofence radius */}

                        <Circle
                          center={[
                            latitude,
                            longitude,
                          ]}
                          radius={
                            Number(
                              zone.radius
                            ) || 100
                          }
                          pathOptions={{
                            color:
                              '#26e0c9',
                            fillColor:
                              '#26e0c9',
                            fillOpacity:
                              0.10,
                            weight: 2,
                          }}
                        />


                        {/* Center marker */}

                        <CircleMarker
                          center={[
                            latitude,
                            longitude,
                          ]}
                          radius={8}
                          pathOptions={{
                            color:
                              '#ffffff',
                            fillColor:
                              '#26e0c9',
                            fillOpacity:
                              1,
                            weight: 3,
                          }}
                          eventHandlers={{
                            click: () => {
                              setSelectedZone(
                                zone
                              )
                            },
                          }}
                        >

                          <Popup>

                            <div
                              style={{
                                minWidth:
                                  180,
                              }}
                            >

                              <strong>
                                {zone.name}
                              </strong>

                              <br />

                              <span>
                                User:{' '}
                                {zone.username ||
                                  zone.user_username ||
                                  zone.user ||
                                  'Unknown'}
                              </span>

                              <br />

                              <span>
                                Radius:{' '}
                                {zone.radius} m
                              </span>

                              <br />

                              <small>
                                Created:{' '}
                                {formatDate(
                                  zone.created_at
                                )}
                              </small>

                            </div>

                          </Popup>

                        </CircleMarker>

                      </React.Fragment>

                    )

                  })}

                </MapContainer>


                {/* Map badge */}

                <div
                  className="position-absolute d-flex align-items-center gap-2 px-3 py-2"
                  style={{
                    top: 20,
                    left: 20,
                    zIndex: 1000,
                    background:
                      'rgba(8,16,29,0.95)',
                    border:
                      '1px solid rgba(38,224,201,0.35)',
                    borderRadius: 22,
                    color: '#ffffff',
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

                  All Safety Zones

                </div>

              </div>

            </div>


            {/* ==================================================
                ZONE LIST
            ================================================== */}

            <div className="col-lg-5">

              <div
                className="glass glass-card"
                style={{
                  minHeight: 560,
                }}
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

                    Safety Zones

                  </h6>

                  <span className="eyebrow">
                    ADMIN
                  </span>

                </div>


                <div
                  className="d-flex flex-column gap-2"
                >

                  {filteredZones.map(
                    (zone) => {

                      const selected =
                        selectedZone?.id ===
                        zone.id


                      return (

                        <button
                          key={zone.id}
                          type="button"
                          onClick={() =>
                            setSelectedZone(
                              zone
                            )
                          }
                          className="text-start"
                          style={{
                            width: '100%',
                            padding: 14,
                            borderRadius: 14,

                            border:
                              selected
                                ? '1px solid rgba(38,224,201,0.55)'
                                : '1px solid var(--border-soft)',

                            background:
                              selected
                                ? 'rgba(38,224,201,0.08)'
                                : 'var(--surface)',

                            color:
                              'var(--text)',

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
                                  borderRadius:
                                    11,
                                  background:
                                    'var(--surface-strong)',
                                }}
                              >

                                <FiShield
                                  className="text-accent"
                                  size={16}
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
                                  {zone.name}
                                </div>

                                <div
                                  className="text-muted-swu"
                                  style={{
                                    fontSize:
                                      '0.68rem',
                                  }}
                                >
                                  User:{' '}
                                  {zone.username ||
                                    zone.user_username ||
                                    zone.user ||
                                    'Unknown'}
                                </div>

                              </div>

                            </div>

                            <span className="status-dot on" />

                          </div>


                          <div
                            className="font-mono text-muted-swu"
                            style={{
                              fontSize:
                                '0.7rem',
                            }}
                          >

                            Radius:{' '}
                            {zone.radius} m

                          </div>


                          <div
                            className="d-flex align-items-center gap-1 text-faint-swu mt-2"
                            style={{
                              fontSize:
                                '0.65rem',
                            }}
                          >

                            <FiClock
                              size={10}
                            />

                            {formatDate(
                              zone.created_at
                            )}

                          </div>

                        </button>

                      )

                    }
                  )}

                </div>

              </div>

            </div>

          </div>

        )}


      {/* ======================================================
          SELECTED ZONE DETAILS
      ====================================================== */}

      {selectedZone && (

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

                  <FiMapPin
                    className="text-accent"
                  />

                  Selected Safety Zone

                </h6>

                <button
                  type="button"
                  className="btn btn-sm btn-swu-ghost"
                  onClick={() =>
                    setSelectedZone(null)
                  }
                >
                  Close
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
                    Zone
                  </div>

                  <div className="fw-semibold">
                    {selectedZone.name}
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
                    User
                  </div>

                  <div className="fw-semibold">
                    {selectedZone.username ||
                      selectedZone.user_username ||
                      selectedZone.user ||
                      'Unknown'}
                  </div>

                </div>


                <div className="col-md-2">

                  <div
                    className="text-muted-swu"
                    style={{
                      fontSize:
                        '0.72rem',
                    }}
                  >
                    Radius
                  </div>

                  <div className="font-mono">
                    {selectedZone.radius} m
                  </div>

                </div>


                <div className="col-md-2">

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
                      selectedZone.latitude
                    ).toFixed(6)}
                  </div>

                </div>


                <div className="col-md-2">

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
                      selectedZone.longitude
                    ).toFixed(6)}
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