import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  FiMapPin,
  FiUsers,
  FiPhoneCall,
  FiClock,
  FiX,
  FiAlertTriangle,
  FiShield,
  FiRefreshCw,
} from 'react-icons/fi'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import {
  createEmergency,
  cancelEmergency,
  getEmergencies,
} from '../../services/emergencyService.js'

import {
  getGuardianUsers,
} from '../../services/guardianService.js'

import {
  getCurrentLocation,
} from '../../services/trackingService.js'


export default function UserEmergency() {

  const [activeEmergency, setActiveEmergency] =
    useState(null)

  const [elapsed, setElapsed] =
    useState(0)

  const [contacts, setContacts] =
    useState([])

  const [location, setLocation] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const [loadingContacts, setLoadingContacts] =
    useState(true)

  const [loadingEmergency, setLoadingEmergency] =
    useState(true)


  // ==========================================================
  // FORMAT TIMER
  // ==========================================================

  const formatTimer = (seconds) => {

    return `${String(
      Math.floor(seconds / 60)
    ).padStart(2, '0')}:${String(
      seconds % 60
    ).padStart(2, '0')}`

  }


  // ==========================================================
  // FORMAT LOCATION
  // ==========================================================

  const formatCoordinate = (value) => {

    if (
      value === null ||
      value === undefined
    ) {
      return '--'
    }

    return Number(value).toFixed(6)

  }


  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatDateTime = (value) => {

    if (!value) {
      return '--'
    }

    const date = new Date(value)

    if (
      Number.isNaN(date.getTime())
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
  // LOAD TRUSTED CONTACTS
  // ==========================================================

  const loadContacts = async () => {

    try {

      setLoadingContacts(true)

      const data =
        await getGuardianUsers()

      const contactData =
        Array.isArray(data)
          ? data
          : data?.results || []

      setContacts(contactData)

    } catch (error) {

      console.error(
        'Failed to load emergency contacts:',
        error
      )

      setContacts([])

    } finally {

      setLoadingContacts(false)

    }

  }


  // ==========================================================
  // LOAD EXISTING EMERGENCY
  // ==========================================================

  const loadEmergency = async () => {

    try {

      setLoadingEmergency(true)

      const data =
        await getEmergencies()

      const emergencies =
        Array.isArray(data)
          ? data
          : data?.results || []

      const active =
        emergencies.find(
          (emergency) =>
            emergency.status === 'active'
        )

      setActiveEmergency(
        active || null
      )

    } catch (error) {

      console.error(
        'Failed to load emergency status:',
        error
      )

      setActiveEmergency(null)

    } finally {

      setLoadingEmergency(false)

    }

  }


  // ==========================================================
  // LOAD CURRENT LOCATION
  // ==========================================================

  const loadLocation = async () => {

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

          updated_at:
            data.updated_at ||
            null,
        })

      }

    } catch (error) {

      console.error(
        'Unable to load current location:',
        error
      )

    }

  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadContacts()
    loadEmergency()
    loadLocation()

  }, [])


  // ==========================================================
  // ACTIVE EMERGENCY TIMER
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


    const updateElapsed = () => {

      const seconds =
        Math.max(
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


    updateElapsed()


    const interval =
      setInterval(
        updateElapsed,
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
  // GET FRESH BROWSER LOCATION
  // ==========================================================

  const getFreshLocation =
    () => {

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

              const data = {

                latitude:
                  position.coords.latitude,

                longitude:
                  position.coords.longitude,

                accuracy:
                  position.coords.accuracy,

              }


              setLocation({

                ...data,

                updated_at:
                  new Date().toISOString(),

              })


              resolve(data)

            },

            (error) => {

              console.error(
                'Browser location error:',
                error
              )

              reject(
                new Error(
                  'Unable to get your current location.'
                )
              )

            },

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

    }


  // ==========================================================
  // ACTIVATE SOS
  // ==========================================================

  const activateEmergency = async () => {

    if (loading || activeEmergency) {
      return
    }

    try {

      setLoading(true)

      let currentPosition = {
        latitude:
          location?.latitude !== null &&
          location?.latitude !== undefined
            ? Number(
                Number(location.latitude).toFixed(7)
              )
            : null,

        longitude:
          location?.longitude !== null &&
          location?.longitude !== undefined
            ? Number(
                Number(location.longitude).toFixed(7)
              )
            : null,
      }

      // ------------------------------------------------------
      // TRY TO GET FRESH GPS
      // ------------------------------------------------------

      try {

        const freshPosition =
          await getFreshLocation()

        currentPosition = {
          latitude:
            Number(
              Number(freshPosition.latitude).toFixed(7)
            ),

          longitude:
            Number(
              Number(freshPosition.longitude).toFixed(7)
            ),
        }

      } catch (locationError) {

        console.warn(
          'Fresh location unavailable:',
          locationError
        )

        const result =
          await Swal.fire({

            title:
              'Location unavailable',

            text:
              'We could not get your current GPS location. Do you still want to activate SOS?',

            icon:
              'warning',

            showCancelButton:
              true,

            confirmButtonText:
              'Activate SOS',

            cancelButtonText:
              'Cancel',

            confirmButtonColor:
              '#ff4d5e',

            background:
              'var(--bg-elevated)',

            color:
              'var(--text)',
          })

        if (!result.isConfirmed) {
          return
        }
      }

      // ------------------------------------------------------
      // CREATE EMERGENCY
      // ------------------------------------------------------

      console.log(
        'Sending emergency:',
        {
          emergency_type: 'sos',
          message: 'Emergency SOS triggered',
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
        }
      )

      const emergency =
        await createEmergency({

          emergency_type:
            'sos',

          message:
            'Emergency SOS triggered',

          latitude:
            currentPosition.latitude !== null
              ? Number(
                  Number(currentPosition.latitude).toFixed(7)
                )
              : null,

          longitude:
            currentPosition.longitude !== null
              ? Number(
                  Number(currentPosition.longitude).toFixed(7)
                )
              : null,
        })

      console.log(
        'Emergency API response:',
        emergency
      )

      // ------------------------------------------------------
      // VERIFY SERVER STATE
      // ------------------------------------------------------

      await loadEmergency()

      // If the API returned an active emergency, use it directly.
      if (
        emergency &&
        emergency.status === 'active'
      ) {

        setActiveEmergency(
          emergency
        )

      } else {

        // loadEmergency() should have found it.
        // If it did not, fetch once more before reporting failure.
        const data =
          await getEmergencies()

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

        } else {

          throw new Error(
            'Emergency was created, but no active emergency was returned by the server.'
          )
        }
      }

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
        'Emergency activation error:',
        error
      )

      console.error(
        'Emergency backend response:',
        error.response?.data
      )

      let errorMessage =
        'Unable to activate emergency alert.'

      const responseData =
        error.response?.data

      if (responseData?.errors) {

        errorMessage =
          Object.entries(
            responseData.errors
          )
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages)
                    ? messages.join(', ')
                    : messages
                }`
            )
            .join('\n')

      } else if (responseData?.detail) {

        errorMessage =
          responseData.detail

      } else if (responseData?.message) {

        errorMessage =
          responseData.message

      } else if (responseData?.error) {

        errorMessage =
          responseData.error

      } else if (error.message) {

        errorMessage =
          error.message

      } else if (error.response?.status) {

        errorMessage =
          `Server error: ${error.response.status}`

      }

      await Swal.fire({

        title:
          'Emergency Failed',

        text:
          errorMessage,

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

      setLoading(false)

    }
  }


  // ==========================================================
  // CANCEL SOS
  // ==========================================================

  const cancel = async () => {

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

      setLoading(true)


      const updated =
        await cancelEmergency(
          activeEmergency.id
        )


      setActiveEmergency(
        updated?.status === 'active'
          ? updated
          : null
      )


      await Swal.fire({

        title:
          'Emergency Cancelled',

        text:
          'Your emergency has been marked as cancelled and your trusted contacts have been notified.',

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
        'Cancel emergency error:',
        error
      )


      Swal.fire({

        title:
          'Unable to Cancel',

        text:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.error ||
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

      setLoading(false)

    }

  }


  // ==========================================================
  // MAIN CONTENT
  // ==========================================================

  return (

    <DashboardLayout
      title="Emergency SOS"
      subtitle="Get help quickly when you need it."
    >

      {/* =====================================================
          ACTIVE EMERGENCY OVERLAY
      ===================================================== */}

      {activeEmergency && (

        <div
          className="position-fixed d-flex flex-column align-items-center justify-content-center text-center p-4"
          style={{
            inset: 0,
            background:
              'rgba(10,14,23,0.94)',
            backdropFilter:
              'blur(10px)',
            zIndex: 2000,
          }}
        >

          <div
            className="sos-ring"
            style={{
              width: 200,
              height: 200,
              position: 'relative',
              marginBottom: 24,
            }}
          >

            <FiAlertTriangle
              size={64}
              className="text-danger-swu"
              style={{
                position:
                  'absolute',
                top: '50%',
                left: '50%',
                transform:
                  'translate(-50%,-50%)',
              }}
            />

          </div>


          <h3
            className="font-display fw-bold text-danger-swu"
          >
            EMERGENCY MODE ACTIVE
          </h3>


          <div
            className="font-mono mb-4"
            style={{
              fontSize:
                '2rem',
            }}
          >
            {formatTimer(
              elapsed
            )}
          </div>


          <div
            className="row g-3 justify-content-center"
            style={{
              maxWidth: 640,
            }}
          >

            {/* Location */}

            <div className="col-md-3">

              <div className="glass p-3">

                <FiMapPin
                  className="text-accent mb-2"
                  size={20}
                />

                <div
                  style={{
                    fontSize:
                      '0.72rem',
                  }}
                >

                  {location

                    ? `${formatCoordinate(
                        location.latitude
                      )}, ${formatCoordinate(
                        location.longitude
                      )}`

                    : 'Location unavailable'}

                </div>

              </div>

            </div>


            {/* Contacts */}

            <div className="col-md-3">

              <div className="glass p-3">

                <FiUsers
                  className="text-accent mb-2"
                  size={20}
                />

                <div
                  style={{
                    fontSize:
                      '0.72rem',
                  }}
                >

                  {contacts.length}{' '}
                  contact
                  {contacts.length !== 1
                    ? 's'
                    : ''}{' '}
                  notified

                </div>

              </div>

            </div>


            {/* Time */}

            <div className="col-md-3">

              <div className="glass p-3">

                <FiClock
                  className="text-accent mb-2"
                  size={20}
                />

                <div
                  style={{
                    fontSize:
                      '0.72rem',
                  }}
                >

                  {formatDateTime(
                    activeEmergency.created_at
                  )}

                </div>

              </div>

            </div>


            {/* Sharing */}

            <div className="col-md-3">

              <div className="glass p-3">

                <span
                  className="status-dot on"
                />

                <div
                  style={{
                    fontSize:
                      '0.72rem',
                  }}
                >
                  Live status: sharing
                </div>

              </div>

            </div>

          </div>


          <button
            className="btn btn-swu-danger mt-4"
            onClick={cancel}
            type="button"
            disabled={loading}
          >

            <FiX
              className="me-1"
            />

            {loading
              ? 'Cancelling...'
              : 'Cancel Emergency'}

          </button>

        </div>

      )}


      {/* =====================================================
          TOP CONTENT
      ===================================================== */}

      <div className="row g-4">

        {/* ===================================================
            SOS
        =================================================== */}

        <div className="col-lg-5">

          <div
            className="glass glass-card text-center py-5 h-100"
          >

            <button
              type="button"
              onClick={activateEmergency}
              disabled={
                loading ||
                loadingEmergency ||
                Boolean(activeEmergency)
              }
              className="mx-auto d-flex align-items-center justify-content-center"
              style={{
                width: 180,
                height: 180,
                borderRadius: '50%',
                border: '3px solid rgba(255,77,94,0.65)',
                background:
                  'radial-gradient(circle, rgba(255,77,94,0.30), rgba(255,77,94,0.08))',
                color: '#ff5c6c',
                boxShadow:
                  '0 0 35px rgba(255,77,94,0.22)',
                cursor:
                  loading ||
                  loadingEmergency ||
                  activeEmergency
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  loading ||
                  loadingEmergency
                    ? 0.65
                    : 1,
                fontWeight: 800,
                fontSize: '1.4rem',
                letterSpacing: '1px',
              }}
            >
              {loading
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

              {loading
                ? 'Processing emergency...'
                : activeEmergency
                  ? 'Emergency is currently active'
                  : 'Press and hold for emergency assistance'}

            </div>

          </div>

        </div>


        {/* ===================================================
            CURRENT STATUS
        =================================================== */}

        <div className="col-lg-7">

          <div className="row g-4">

            <div className="col-md-6">

              <div className="glass glass-card h-100">

                <h6
                  className="mb-3 d-flex align-items-center gap-2"
                >

                  <FiShield
                    className="text-accent"
                  />

                  Current Status

                </h6>


                <div
                  className="d-flex justify-content-between py-2"
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
                    Emergency
                  </span>

                  <span
                    className={
                      activeEmergency
                        ? 'text-danger-swu'
                        : 'text-muted-swu'
                    }
                  >

                    {activeEmergency
                      ? 'Active'
                      : 'Inactive'}

                  </span>

                </div>


                <div
                  className="d-flex justify-content-between py-2"
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
                    Location
                  </span>

                  <span
                    className={
                      location
                        ? 'status-dot on'
                        : 'status-dot off'
                    }
                  />

                </div>


                <div
                  className="d-flex justify-content-between py-2"
                  style={{
                    fontSize:
                      '0.84rem',
                  }}
                >

                  <span
                    className="text-muted-swu"
                  >
                    Timer
                  </span>

                  <span className="font-mono">

                    {activeEmergency
                      ? formatTimer(
                          elapsed
                        )
                      : '00:00'}

                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                CONTACTS
            ================================================= */}

            <div className="col-md-6">

              <div className="glass glass-card h-100">

                <h6
                  className="mb-3 d-flex align-items-center gap-2"
                >

                  <FiUsers
                    className="text-accent"
                  />

                  Emergency Contacts

                </h6>


                {loadingContacts ? (

                  <div
                    className="text-muted-swu"
                    style={{
                      fontSize:
                        '0.8rem',
                    }}
                  >
                    Loading contacts...
                  </div>

                ) : contacts.length === 0 ? (

                  <div
                    className="text-muted-swu"
                    style={{
                      fontSize:
                        '0.8rem',
                    }}
                  >

                    No trusted contacts added.

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

                    ))

                )}

              </div>

            </div>


            {/* =================================================
                LOCATION
            ================================================= */}

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

                    Current Location

                  </h6>

                  <button
                    type="button"
                    className="btn btn-sm btn-swu-ghost d-flex align-items-center gap-2"
                    onClick={
                      loadLocation
                    }
                  >

                    <FiRefreshCw
                      size={13}
                    />

                    Refresh

                  </button>

                </div>


                {location ? (

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

                        {formatCoordinate(
                          location.latitude
                        )}

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

                        {formatCoordinate(
                          location.longitude
                        )}

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

                        {location.accuracy
                          ? `${Math.round(
                              location.accuracy
                            )} m`
                          : 'N/A'}

                      </div>

                    </div>

                  </div>

                ) : (

                  <div
                    className="text-muted-swu"
                    style={{
                      fontSize:
                        '0.82rem',
                    }}
                  >
                    Current location is unavailable.
                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          EMERGENCY SERVICES
      ===================================================== */}

      <div
        className="glass glass-card mt-4"
      >

        <h6
          className="mb-3 d-flex align-items-center gap-2"
        >

          <FiPhoneCall
            className="text-accent"
          />

          Emergency Services

        </h6>


        <div
          className="row g-2"
          style={{
            fontSize:
              '0.84rem',
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