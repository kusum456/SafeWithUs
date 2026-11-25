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
  FiShield,
  FiClock,
} from 'react-icons/fi'

import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import {
  getAlerts,
} from '../../services/alertService.js'


const categories = [
  'All',
  'Safety',
  'Location',
  'Emergency',
  'System',
]


export default function UserAlerts() {

  const [alerts, setAlerts] = useState([])

  const [filter, setFilter] =
    useState('All')

  const [query, setQuery] =
    useState('')

  const [loading, setLoading] =
    useState(true)


  // ==========================================================
  // FORMAT BACKEND ALERT
  // ==========================================================

  const formatAlert = (alert) => {

    const message =
      alert.message ||
      'Safety alert generated.'


    let category = 'Safety'

    const lowerMessage =
      message.toLowerCase()


    if (
      lowerMessage.includes('emergency') ||
      lowerMessage.includes('sos')
    ) {
      category = 'Emergency'
    }

    else if (
      lowerMessage.includes('location')
    ) {
      category = 'Location'
    }

    else if (
      lowerMessage.includes('system')
    ) {
      category = 'System'
    }


    return {

      id:
        alert.id,

      title:
        category === 'Emergency'
          ? 'Emergency Alert'
          : category === 'Location'
            ? 'Location Alert'
            : 'Safe Zone Alert',

      desc:
        message,

      category,

      read:
        false,

      created_at:
        alert.created_at,

      latitude:
        alert.latitude,

      longitude:
        alert.longitude,

      geofence:
        alert.geofence,

      user:
        alert.user,

    }

  }


  // ==========================================================
  // LOAD ALERTS
  // ==========================================================

  const loadAlerts = async () => {

    try {

      setLoading(true)

      const data =
        await getAlerts()


      const rawAlerts =
        Array.isArray(data)
          ? data
          : data?.results || []


      const formatted =
        rawAlerts.map(
          formatAlert
        )


      setAlerts(
        formatted
      )

    } catch (error) {

      console.error(
        'Failed to load alerts:',
        error
      )


      if (
        error.response?.status === 401
      ) {

        Swal.fire({

          title:
            'Session Expired',

          text:
            'Please login again to view your alerts.',

          icon:
            'warning',

          background:
            'var(--bg-elevated)',

          color:
            'var(--text)',
        })

      } else {

        Swal.fire({

          title:
            'Unable to Load Alerts',

          text:
            error.response?.data?.detail ||
            'Something went wrong while loading alerts.',

          icon:
            'error',

          background:
            'var(--bg-elevated)',

          color:
            'var(--text)',
        })

      }

    } finally {

      setLoading(false)

    }

  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadAlerts()

  }, [])


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredAlerts =
    useMemo(() => {

      const search =
        query
          .toLowerCase()
          .trim()


      return alerts.filter(
        (alert) => {

          const matchesCategory =
            filter === 'All' ||
            alert.category === filter


          const matchesQuery =
            !search ||
            alert.title
              .toLowerCase()
              .includes(search) ||
            alert.desc
              .toLowerCase()
              .includes(search)


          return (
            matchesCategory &&
            matchesQuery
          )

        }
      )

    }, [
      alerts,
      filter,
      query,
    ])


  // ==========================================================
  // MARK READ
  // ==========================================================

  const markRead = (
    id
  ) => {

    setAlerts(
      (current) =>
        current.map(
          (alert) =>
            alert.id === id
              ? {
                  ...alert,
                  read: true,
                }
              : alert
        )
    )

  }


  // ==========================================================
  // REMOVE FROM CURRENT VIEW
  // ==========================================================

  const remove = async (
    id
  ) => {

    const result =
      await Swal.fire({

        title:
          'Remove alert from view?',

        text:
          'This only removes the alert from the current screen. Your current backend does not provide alert deletion.',

        icon:
          'warning',

        showCancelButton:
          true,

        confirmButtonText:
          'Remove',

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


    setAlerts(
      (current) =>
        current.filter(
          (alert) =>
            alert.id !== id
        )
    )

  }


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    value
  ) => {

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
        dateStyle:
          'medium',

        timeStyle:
          'short',
      }
    )

  }


  // ==========================================================
  // CATEGORY ICON
  // ==========================================================

  const getCategoryIcon = (
    category
  ) => {

    if (
      category === 'Location'
    ) {

      return (
        <FiMapPin
          size={18}
        />
      )

    }


    if (
      category === 'Emergency'
    ) {

      return (
        <FiAlertTriangle
          size={18}
        />
      )

    }


    return (
      <FiShield
        size={18}
      />
    )

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <DashboardLayout
      title="Alerts"
      subtitle="View safety alerts generated from your account activity."
    >

      {/* ======================================================
          TOP CONTROLS
      ====================================================== */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >

        {/* CATEGORY */}

        <div
          className="d-flex flex-wrap gap-2"
        >

          {categories.map(
            (category) => (

              <button
                key={category}
                type="button"
                className="btn btn-sm"
                onClick={() =>
                  setFilter(
                    category
                  )
                }
                style={{
                  borderRadius: 10,

                  border:
                    '1px solid var(--border)',

                  background:
                    filter === category
                      ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                      : 'var(--surface)',

                  color:
                    filter === category
                      ? '#08111a'
                      : 'var(--text-muted)',

                  fontWeight: 500,
                }}
              >

                {category}

              </button>

            )
          )}

        </div>


        {/* SEARCH + REFRESH */}

        <div
          className="d-flex align-items-center gap-2"
        >

          <div
            className="position-relative"
            style={{
              minWidth:
                230,
            }}
          >

            <FiSearch
              className="position-absolute text-faint-swu"
              size={15}
              style={{
                left:
                  12,

                top:
                  11,
              }}
            />

            <input
              className="form-control form-control-swu ps-5"
              placeholder="Search alerts..."
              value={
                query
              }
              onChange={
                (e) =>
                  setQuery(
                    e.target.value
                  )
              }
            />

          </div>


          <button
            type="button"
            className="btn btn-swu-ghost d-flex align-items-center gap-2"
            onClick={
              loadAlerts
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

        </div>

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
            Loading alerts...
          </div>

        </div>

      )}


      {/* ======================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        filteredAlerts.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >

          <FiAlertTriangle
            size={42}
            className="text-accent mb-3"
          />

          <h6 className="fw-bold">
            No Alerts
          </h6>

          <p
            className="text-muted-swu mb-0"
            style={{
              fontSize:
                '0.85rem',
            }}
          >

            {query ||
            filter !== 'All'
              ? 'No alerts match your filters.'
              : 'You currently have no safety alerts.'}

          </p>

        </div>

      )}


      {/* ======================================================
          ALERT LIST
      ====================================================== */}

      {!loading &&
        filteredAlerts.length > 0 && (

        <div
          className="d-flex flex-column gap-3"
        >

          {filteredAlerts.map(
            (alert) => (

              <div
                key={
                  alert.id
                }
                className="glass glass-card"
                style={{
                  opacity:
                    alert.read
                      ? 0.65
                      : 1,
                }}
              >

                <div className="row g-4">


                  {/* ==================================================
                      ALERT INFORMATION
                  ================================================== */}

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
                            width:
                              44,

                            height:
                              44,

                            borderRadius:
                              13,

                            background:
                              alert.category === 'Emergency'
                                ? 'rgba(255,77,94,0.12)'
                                : 'var(--surface-strong)',

                            color:
                              alert.category === 'Emergency'
                                ? '#ff5c6c'
                                : 'var(--accent)',
                          }}
                        >

                          {getCategoryIcon(
                            alert.category
                          )}

                        </div>


                        <div>

                          <h6
                            className="fw-bold mb-1"
                          >

                            {alert.title}

                          </h6>

                          <div
                            className="text-muted-swu"
                            style={{
                              fontSize:
                                '0.7rem',
                            }}
                          >

                            Alert #{alert.id}

                          </div>

                        </div>

                      </div>


                      <span
                        className={
                          alert.read
                            ? 'status-dot off'
                            : alert.category === 'Emergency'
                              ? 'status-dot danger'
                              : 'status-dot on'
                        }
                      />

                    </div>


                    {/* MESSAGE */}

                    <div
                      className="mb-3"
                      style={{
                        fontSize:
                          '0.9rem',
                      }}
                    >

                      {alert.desc}

                    </div>


                    {/* CATEGORY */}

                    <div
                      className="d-flex align-items-center gap-2 mb-2"
                      style={{
                        fontSize:
                          '0.78rem',
                      }}
                    >

                      <FiShield
                        className="text-accent"
                        size={14}
                      />

                      <span
                        className="text-muted-swu"
                      >
                        Category:
                      </span>

                      <span>
                        {alert.category}
                      </span>

                    </div>


                    {/* TIME */}

                    <div
                      className="d-flex align-items-center gap-2 text-muted-swu"
                      style={{
                        fontSize:
                          '0.74rem',
                      }}
                    >

                      <FiClock
                        size={13}
                      />

                      {formatDate(
                        alert.created_at
                      )}

                    </div>

                  </div>


                  {/* ==================================================
                      LOCATION
                  ================================================== */}

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


                      {alert.latitude !== null &&
                      alert.latitude !== undefined &&
                      alert.longitude !== null &&
                      alert.longitude !== undefined ? (

                        <div
                          className="font-mono"
                          style={{
                            fontSize:
                              '0.76rem',
                          }}
                        >

                          <div className="mb-3">

                            <div
                              className="text-muted-swu"
                            >
                              Latitude
                            </div>

                            <div>
                              {Number(
                                alert.latitude
                              ).toFixed(
                                6
                              )}
                            </div>

                          </div>


                          <div>

                            <div
                              className="text-muted-swu"
                            >
                              Longitude
                            </div>

                            <div>
                              {Number(
                                alert.longitude
                              ).toFixed(
                                6
                              )}
                            </div>

                          </div>

                        </div>

                      ) : (

                        <div
                          className="text-muted-swu"
                          style={{
                            fontSize:
                              '0.78rem',
                          }}
                        >

                          Location was not included with this alert.

                        </div>

                      )}

                    </div>

                  </div>

                </div>


                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div
                  className="d-flex justify-content-end gap-2 mt-3 pt-3"
                  style={{
                    borderTop:
                      '1px solid var(--border-soft)',
                  }}
                >

                  {!alert.read && (

                    <button
                      type="button"
                      className="btn btn-sm btn-swu-ghost"
                      onClick={() =>
                        markRead(
                          alert.id
                        )
                      }
                    >
                      Mark as Read
                    </button>

                  )}


                  <button
                    type="button"
                    className="btn btn-sm btn-swu-ghost"
                    onClick={() =>
                      remove(
                        alert.id
                      )
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* ======================================================
          INFORMATION
      ====================================================== */}

      {!loading &&
        filteredAlerts.length > 0 && (

        <div
          className="text-muted-swu d-flex align-items-center gap-2 mt-4"
          style={{
            fontSize:
              '0.72rem',
          }}
        >

          <FiMapPin
            size={13}
          />

          Alerts are generated automatically from your safety-zone and emergency activity.

        </div>

      )}

    </DashboardLayout>

  )
}