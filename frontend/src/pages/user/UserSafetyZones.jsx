import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet'

import L from 'leaflet'

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiMapPin,
  FiRefreshCw,
  FiNavigation,
} from 'react-icons/fi'

import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import {
  getGeofences,
  createGeofence,
  updateGeofence,
  deleteGeofence,
} from '../../services/geofence.js'

import 'leaflet/dist/leaflet.css'


// ============================================================
// LEAFLET DEFAULT ICON FIX
// ============================================================

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})


// ============================================================
// MAP CLICK HANDLER
// ============================================================

function LocationSelector({
  onSelect,
}) {

  useMapEvents({

    click(event) {

      onSelect({
        latitude:
          event.latlng.lat,

        longitude:
          event.latlng.lng,
      })

    },

  })

  return null
}


// ============================================================
// MAP CENTER
// ============================================================

function MapCenter({
  latitude,
  longitude,
  zoom = 15,
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
      zoom,
      {
        animate: true,
      }
    )

  }, [
    latitude,
    longitude,
    zoom,
    map,
  ])

  return null
}


// ============================================================
// USER SAFETY ZONES
// ============================================================

export default function UserSafetyZones() {

  const [zones, setZones] =
    useState([])

  const [showMap, setShowMap] =
    useState(false)

  const [editing, setEditing] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [selectedLocation, setSelectedLocation] =
    useState(null)

  const [mapCenter, setMapCenter] =
    useState([
      20.2961,
      85.8245,
    ])

  const [mapZoom, setMapZoom] =
    useState(13)


  // ==========================================================
  // LOAD ZONES
  // ==========================================================

  const loadZones = async () => {

    try {

      setLoading(true)

      const data =
        await getGeofences()

      setZones(
        Array.isArray(data)
          ? data
          : data?.results || []
      )

    } catch (error) {

      console.error(
        'Load geofences error:',
        error
      )

      Swal.fire({
        title:
          'Unable to Load Zones',

        text:
          error.response?.data?.detail ||
          'Could not load your safety zones.',

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


  useEffect(() => {

    loadZones()

  }, [])


  // ==========================================================
  // GET CURRENT GPS
  // ==========================================================

  const getCurrentLocation = () => {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        if (
          !navigator.geolocation
        ) {

          reject(
            new Error(
              'Geolocation is not supported by your browser.'
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

            })

          },

          (error) => {

            reject(
              error
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
  // OPEN ADD
  // ==========================================================

  const openAdd = () => {

    setEditing(null)

    setSelectedLocation(null)

    setShowMap(true)

  }


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEdit = (zone) => {

    setEditing(zone)

    setSelectedLocation({

      latitude:
        Number(
          zone.latitude
        ),

      longitude:
        Number(
          zone.longitude
        ),

    })

    setMapCenter([

      Number(
        zone.latitude
      ),

      Number(
        zone.longitude
      ),

    ])

    setMapZoom(16)

    setShowMap(true)

  }


  // ==========================================================
  // USE CURRENT LOCATION
  // ==========================================================

  const useMyLocation = async () => {

    try {

      const location =
        await getCurrentLocation()

      setSelectedLocation(
        location
      )

      setMapCenter([

        location.latitude,
        location.longitude,

      ])

      setMapZoom(17)

    } catch (error) {

      console.error(
        'Current location error:',
        error
      )

      Swal.fire({

        title:
          'Location Unavailable',

        text:
          'Please allow location access in your browser or select a point directly on the map.',

        icon:
          'warning',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

    }

  }


  // ==========================================================
  // SELECT MAP LOCATION
  // ==========================================================

  const handleMapSelection = (
    location
  ) => {

    setSelectedLocation(
      location
    )

  }


  // ==========================================================
  // SAVE ZONE
  // ==========================================================

  const handleSave = async (
    event
  ) => {

    event.preventDefault()


    if (
      !selectedLocation
    ) {

      Swal.fire({

        title:
          'Select a Location',

        text:
          'Click on the map to choose where this safety zone should be created.',

        icon:
          'warning',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    const form =
      new FormData(
        event.target
      )


    const name =
      form
        .get('name')
        ?.trim()


    const radius =
      Number(
        form.get('radius')
      )


    if (!name) {

      Swal.fire({

        title:
          'Zone Name Required',

        text:
          'Please enter a name for your safety zone.',

        icon:
          'warning',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    if (
      !radius ||
      radius <= 0
    ) {

      Swal.fire({

        title:
          'Invalid Radius',

        text:
          'Radius must be greater than 0 meters.',

        icon:
          'warning',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    try {

      setSaving(true)


      // ======================================================
      // UPDATE
      // ======================================================

      if (editing) {

        const updated =
          await updateGeofence(

            editing.id,

            {
              name,
              radius,

              latitude:
                selectedLocation.latitude,

              longitude:
                selectedLocation.longitude,
            }

          )


        setZones(
          (current) =>
            current.map(
              (zone) =>
                zone.id ===
                editing.id
                  ? updated
                  : zone
            )
        )


        await Swal.fire({

          title:
            'Zone Updated',

          text:
            `${name} has been updated successfully.`,

          icon:
            'success',

          timer:
            1500,

          showConfirmButton:
            false,

          background:
            'var(--bg-elevated)',

          color:
            'var(--text)',
        })

      }

      // ======================================================
      // CREATE
      // ======================================================

      else {

        const newZone =
          await createGeofence({

            name,

            latitude:
              selectedLocation.latitude,

            longitude:
              selectedLocation.longitude,

            radius,

          })


        setZones(
          (current) => [
            ...current,
            newZone,
          ]
        )


        await Swal.fire({

          title:
            'Safety Zone Created',

          text:
            `${name} has been added successfully.`,

          icon:
            'success',

          timer:
            1800,

          showConfirmButton:
            false,

          background:
            'var(--bg-elevated)',

          color:
            'var(--text)',
        })

      }


      closeMap()

    } catch (error) {

      console.error(
        'Save geofence error:',
        error
      )


      let message =
        'Unable to save the safety zone.'


      if (
        error.response?.data
      ) {

        const data =
          error.response.data


        if (
          data.detail
        ) {

          message =
            data.detail

        } else {

          message =
            Object.values(
              data
            )
              .flat()
              .join(' ')

        }

      }


      Swal.fire({

        title:
          'Unable to Save',

        text:
          message,

        icon:
          'error',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

    } finally {

      setSaving(false)

    }

  }


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (
    id
  ) => {

    const zone =
      zones.find(
        (item) =>
          item.id === id
      )


    const result =
      await Swal.fire({

        title:
          'Delete this zone?',

        text:
          zone
            ? `${zone.name} will be permanently deleted.`
            : 'This zone will be deleted.',

        icon:
          'warning',

        showCancelButton:
          true,

        confirmButtonText:
          'Delete',

        cancelButtonText:
          'Cancel',

        confirmButtonColor:
          '#ff4d5e',

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

      await deleteGeofence(
        id
      )


      setZones(
        (current) =>
          current.filter(
            (zone) =>
              zone.id !== id
          )
      )


      Swal.fire({

        title:
          'Deleted',

        text:
          'Safety zone removed successfully.',

        icon:
          'success',

        timer:
          1300,

        showConfirmButton:
          false,

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

    } catch (error) {

      console.error(
        'Delete geofence error:',
        error
      )


      Swal.fire({

        title:
          'Delete Failed',

        text:
          error.response?.data?.detail ||
          'Unable to delete this zone.',

        icon:
          'error',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

    }

  }


  // ==========================================================
  // CLOSE
  // ==========================================================

  const closeMap = () => {

    if (saving) {
      return
    }

    setShowMap(false)

    setEditing(null)

    setSelectedLocation(null)

  }


  // ==========================================================
  // DATE
  // ==========================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return 'Unknown'
    }


    const value =
      new Date(date)


    if (
      Number.isNaN(
        value.getTime()
      )
    ) {

      return 'Unknown'

    }


    return value.toLocaleDateString(
      'en-IN',
      {
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric',
      }
    )

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <DashboardLayout
      title="Safety Zones"
      subtitle="Create and manage your trusted locations."
    >

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div
        className="d-flex justify-content-end gap-2 mb-4"
      >

        <button
          type="button"
          className="btn btn-swu-ghost d-flex align-items-center gap-2"
          onClick={
            loadZones
          }
          disabled={
            loading
          }
        >

          <FiRefreshCw
            size={15}
          />

          Refresh

        </button>


        <button
          type="button"
          className="btn btn-swu-primary d-flex align-items-center gap-2"
          onClick={
            openAdd
          }
        >

          <FiPlus />

          Add Zone

        </button>

      </div>


      {/* ======================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        zones.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >

          <FiShield
            size={45}
            className="text-accent mb-3"
          />

          <h5 className="fw-bold">
            No Safety Zones
          </h5>

          <p
            className="text-muted-swu"
            style={{
              fontSize:
                '0.85rem',
            }}
          >
            Create a zone around your home, college, office, or another trusted location.
          </p>


          <button
            type="button"
            className="btn btn-swu-primary d-inline-flex align-items-center gap-2 mt-2"
            onClick={
              openAdd
            }
          >

            <FiPlus />

            Create Safety Zone

          </button>

        </div>

      )}


      {/* ======================================================
          ZONES
      ====================================================== */}

      {!loading &&
        zones.length > 0 && (

        <div className="row g-4">

          {zones.map(
            (zone) => (

              <div
                key={
                  zone.id
                }
                className="col-md-6 col-lg-4"
              >

                <div
                  className="glass glass-card h-100"
                >

                  <div
                    className="d-flex align-items-center justify-content-between mb-3"
                  >

                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width:
                          42,

                        height:
                          42,

                        borderRadius:
                          12,

                        background:
                          'var(--surface-strong)',
                      }}
                    >

                      <FiShield
                        className="text-accent"
                        size={18}
                      />

                    </div>


                    <span
                      className="status-dot on"
                    />

                  </div>


                  <h6
                    className="fw-bold mb-1"
                  >
                    {zone.name}
                  </h6>


                  <div
                    className="text-accent mb-3"
                    style={{
                      fontSize:
                        '0.8rem',
                    }}
                  >
                    Safe Zone
                  </div>


                  <div
                    className="font-mono text-faint-swu mb-3"
                    style={{
                      fontSize:
                        '0.75rem',
                    }}
                  >

                    <div>
                      Radius: {
                        zone.radius
                      } m
                    </div>

                    <div>
                      Latitude:{' '}
                      {Number(
                        zone.latitude
                      ).toFixed(
                        6
                      )}
                    </div>

                    <div>
                      Longitude:{' '}
                      {Number(
                        zone.longitude
                      ).toFixed(
                        6
                      )}
                    </div>

                    <div>
                      Created:{' '}
                      {formatDate(
                        zone.created_at
                      )}
                    </div>

                  </div>


                  <div
                    className="d-flex gap-2"
                  >

                    <button
                      type="button"
                      className="btn btn-sm btn-swu-ghost flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      onClick={() =>
                        openEdit(
                          zone
                        )
                      }
                    >

                      <FiEdit2
                        size={12}
                      />

                      Edit

                    </button>


                    <button
                      type="button"
                      className="btn btn-sm btn-swu-ghost"
                      onClick={() =>
                        handleDelete(
                          zone.id
                        )
                      }
                    >

                      <FiTrash2
                        size={12}
                      />

                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* ======================================================
          CREATE / EDIT MAP MODAL
      ====================================================== */}

      {showMap && (

        <div
          className="position-fixed"
          style={{
            inset:
              0,

            zIndex:
              3000,

            background:
              'rgba(5,10,18,0.82)',

            backdropFilter:
              'blur(8px)',

            overflowY:
              'auto',

            padding:
              '30px 15px',
          }}
        >

          <div
            className="mx-auto"
            style={{
              maxWidth:
                1050,

              background:
                'var(--bg-elevated)',

              border:
                '1px solid var(--border-soft)',

              borderRadius:
                20,

              overflow:
                'hidden',

              boxShadow:
                '0 30px 80px rgba(0,0,0,0.45)',
            }}
          >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
              className="d-flex align-items-center justify-content-between px-4 py-3"
              style={{
                borderBottom:
                  '1px solid var(--border-soft)',
              }}
            >

              <div>

                <h5
                  className="fw-bold mb-1"
                >

                  {editing
                    ? 'Edit Safety Zone'
                    : 'Add Safety Zone'}

                </h5>


                <div
                  className="text-muted-swu"
                  style={{
                    fontSize:
                      '0.74rem',
                  }}
                >

                  Click anywhere on the map to choose the zone location.

                </div>

              </div>


              <button
                type="button"
                className="btn btn-sm btn-swu-ghost"
                onClick={
                  closeMap
                }
                disabled={
                  saving
                }
              >

                ×

              </button>

            </div>


            {/* ==================================================
                MAP
            ================================================== */}

            <div
              className="position-relative"
              style={{
                height:
                  460,
              }}
            >

              <MapContainer
                center={
                  selectedLocation
                    ? [
                        selectedLocation.latitude,
                        selectedLocation.longitude,
                      ]
                    : mapCenter
                }
                zoom={
                  mapZoom
                }
                scrollWheelZoom={
                  true
                }
                style={{
                  width:
                    '100%',

                  height:
                    '100%',
                }}
              >

                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                <MapCenter
                  latitude={
                    selectedLocation?.latitude
                  }
                  longitude={
                    selectedLocation?.longitude
                  }
                  zoom={
                    mapZoom
                  }
                />


                <LocationSelector
                  onSelect={
                    handleMapSelection
                  }
                />


                {/* Existing safety zones */}

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
                      )
                    ) {

                      return null

                    }


                    return (

                      <Circle
                        key={
                          `zone-${zone.id}`
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
                            '#26e0c9',

                          fillColor:
                            '#26e0c9',

                          fillOpacity:
                            0.06,

                          weight:
                            2,
                        }}
                      />

                    )

                  }
                )}


                {/* Selected location */}

                {selectedLocation && (

                  <>

                    <Marker
                      position={[
                        selectedLocation.latitude,
                        selectedLocation.longitude,
                      ]}
                    />


                    <Circle
                      center={[
                        selectedLocation.latitude,
                        selectedLocation.longitude,
                      ]}
                      radius={
                        Number(
                          document
                            ?.querySelector(
                              'input[name="radius"]'
                            )
                            ?.value ||
                            300
                        )
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

                  </>

                )}

              </MapContainer>


              {/* Map controls */}

              <div
                className="position-absolute d-flex gap-2"
                style={{
                  top:
                    15,

                  right:
                    15,

                  zIndex:
                    1000,
                }}
              >

                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-2"
                  onClick={
                    useMyLocation
                  }
                  style={{
                    background:
                      '#08101d',

                    color:
                      '#ffffff',

                    border:
                      '1px solid rgba(38,224,201,0.4)',

                    borderRadius:
                      10,
                  }}
                >

                  <FiNavigation
                    size={14}
                  />

                  Use My Location

                </button>

              </div>


              {/* Instruction */}

              <div
                className="position-absolute px-3 py-2"
                style={{
                  left:
                    '50%',

                  bottom:
                    15,

                  transform:
                    'translateX(-50%)',

                  zIndex:
                    1000,

                  background:
                    'rgba(8,16,29,0.94)',

                  color:
                    '#ffffff',

                  border:
                    '1px solid rgba(38,224,201,0.35)',

                  borderRadius:
                    12,

                  fontSize:
                    '0.74rem',

                  whiteSpace:
                    'nowrap',
                }}
              >

                <FiMapPin
                  className="text-accent me-1"
                  size={13}
                />

                Click the map to select a location

              </div>

            </div>


            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={
                handleSave
              }
            >

              <div
                className="px-4 py-4"
              >

                <div className="row g-3">


                  {/* NAME */}

                  <div className="col-md-6">

                    <label
                      className="form-label"
                      style={{
                        fontSize:
                          '0.82rem',
                      }}
                    >
                      Zone Name
                    </label>


                    <input
                      required
                      name="name"
                      type="text"
                      defaultValue={
                        editing?.name ||
                        ''
                      }
                      className="form-control form-control-swu"
                      placeholder="e.g. Home"
                    />

                  </div>


                  {/* RADIUS */}

                  <div className="col-md-6">

                    <label
                      className="form-label"
                      style={{
                        fontSize:
                          '0.82rem',
                      }}
                    >
                      Radius
                    </label>


                    <div className="input-group">

                      <input
                        required
                        name="radius"
                        type="number"
                        min="1"
                        max="100000"
                        defaultValue={
                          editing?.radius ||
                          300
                        }
                        className="form-control form-control-swu"
                        placeholder="300"
                      />


                      <span
                        className="input-group-text"
                        style={{
                          background:
                            'var(--surface-strong)',

                          border:
                            '1px solid var(--border-soft)',

                          color:
                            'var(--text)',
                        }}
                      >
                        m
                      </span>

                    </div>

                  </div>


                  {/* SELECTED COORDINATES */}

                  <div className="col-12">

                    <div
                      className="glass p-3"
                    >

                      <div
                        className="d-flex align-items-center gap-2 mb-2"
                      >

                        <FiMapPin
                          className="text-accent"
                          size={15}
                        />

                        <span
                          className="fw-semibold"
                        >
                          Selected Location
                        </span>

                      </div>


                      {selectedLocation ? (

                        <div
                          className="font-mono"
                          style={{
                            fontSize:
                              '0.76rem',
                          }}
                        >

                          Latitude:{' '}

                          {Number(
                            selectedLocation.latitude
                          ).toFixed(
                            6
                          )}

                          {'   '}

                          Longitude:{' '}

                          {Number(
                            selectedLocation.longitude
                          ).toFixed(
                            6
                          )}

                        </div>

                      ) : (

                        <div
                          className="text-muted-swu"
                          style={{
                            fontSize:
                              '0.78rem',
                          }}
                        >

                          No location selected. Click the map or use your current location.

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              </div>


              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div
                className="d-flex justify-content-end gap-2 px-4 py-3"
                style={{
                  borderTop:
                    '1px solid var(--border-soft)',
                }}
              >

                <button
                  type="button"
                  className="btn btn-swu-ghost"
                  onClick={
                    closeMap
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="btn btn-swu-primary"
                  disabled={
                    saving
                  }
                >

                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                      />

                      Saving...
                    </>
                  ) : (
                    editing
                      ? 'Save Changes'
                      : 'Create Safety Zone'
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </DashboardLayout>
  )
}