import React, { useEffect, useMemo, useState } from 'react'
import {
  FiAlertTriangle,
  FiMapPin,
  FiUser,
  FiClock,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { getAllEmergencies } from '../../services/emergencyService.js'


const filters = [
  'All',
  'Active',
  'Resolved',
  'Cancelled',
]


export default function AdminEmergency() {

  const [emergencies, setEmergencies] = useState([])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)


  // ==========================================================
  // LOAD ALL EMERGENCIES
  // ==========================================================

  const loadEmergencies = async () => {

    try {

      setLoading(true)

      const data = await getAllEmergencies()

      setEmergencies(
        Array.isArray(data)
          ? data
          : data?.results || []
      )

    } catch (error) {

      console.error(
        'Admin emergency error:',
        error
      )

      Swal.fire({
        title: 'Unable to Load Emergencies',
        text:
          error.response?.data?.detail ||
          'Unable to load emergency records.',
        icon: 'error',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })

    } finally {

      setLoading(false)

    }
  }


  useEffect(() => {

    loadEmergencies()

  }, [])


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredEmergencies = useMemo(() => {

    const search = query
      .toLowerCase()
      .trim()


    return emergencies.filter((emergency) => {

      const status =
        String(
          emergency.status || ''
        ).toLowerCase()


      const username =
        String(
          emergency.username ||
          emergency.user_username ||
          emergency.user ||
          ''
        ).toLowerCase()


      const type =
        String(
          emergency.emergency_type ||
          ''
        ).toLowerCase()


      const message =
        String(
          emergency.message ||
          ''
        ).toLowerCase()


      const matchesFilter =
        filter === 'All' ||
        status === filter.toLowerCase()


      const matchesSearch =
        !search ||
        username.includes(search) ||
        type.includes(search) ||
        message.includes(search)


      return (
        matchesFilter &&
        matchesSearch
      )

    })

  }, [
    emergencies,
    filter,
    query,
  ])


  // ==========================================================
  // COUNTS
  // ==========================================================

  const activeCount = emergencies.filter(
    (emergency) =>
      emergency.status === 'active'
  ).length


  const resolvedCount = emergencies.filter(
    (emergency) =>
      emergency.status === 'resolved'
  ).length


  const cancelledCount = emergencies.filter(
    (emergency) =>
      emergency.status === 'cancelled'
  ).length


  // ==========================================================
  // STATUS STYLE
  // ==========================================================

  const getStatusStyle = (status) => {

    if (status === 'active') {

      return {
        background:
          'rgba(255, 77, 94, 0.12)',
        color: '#ff5c6c',
        border:
          '1px solid rgba(255, 77, 94, 0.30)',
      }

    }


    if (status === 'resolved') {

      return {
        background:
          'rgba(38, 224, 201, 0.10)',
        color: '#26e0c9',
        border:
          '1px solid rgba(38, 224, 201, 0.25)',
      }

    }


    return {
      background:
        'rgba(120, 130, 150, 0.10)',
      color: '#aeb8c8',
      border:
        '1px solid rgba(120, 130, 150, 0.20)',
    }

  }


  // ==========================================================
  // DISPLAY TYPE
  // ==========================================================

  const getEmergencyLabel = (type) => {

    const types = {
      sos: 'SOS',
      medical: 'Medical',
      fire: 'Fire',
      accident: 'Accident',
      police: 'Police',
      other: 'Other',
    }

    return (
      types[type] ||
      type ||
      'Emergency'
    )

  }


  return (

    <DashboardLayout
      title="Emergency Monitoring"
      subtitle="Monitor emergency events across the SafeWithUs network."
    >

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="row g-4 mb-4">

        <div className="col-md-4">

          <div className="glass glass-card">

            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.78rem',
              }}
            >
              Active Emergencies
            </div>

            <div
              className="font-mono fw-bold text-danger-swu"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {activeCount}
            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="glass glass-card">

            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.78rem',
              }}
            >
              Resolved
            </div>

            <div
              className="font-mono fw-bold text-accent"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {resolvedCount}
            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="glass glass-card">

            <div
              className="text-muted-swu mb-2"
              style={{
                fontSize: '0.78rem',
              }}
            >
              Cancelled
            </div>

            <div
              className="font-mono fw-bold"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {cancelledCount}
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >

        <div className="d-flex flex-wrap gap-2">

          {filters.map((item) => (

            <button
              key={item}
              type="button"
              className="btn btn-sm"
              onClick={() =>
                setFilter(item)
              }
              style={{
                borderRadius: 10,
                border:
                  '1px solid var(--border)',
                background:
                  filter === item
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                    : 'var(--surface)',
                color:
                  filter === item
                    ? '#08111a'
                    : 'var(--text-muted)',
              }}
            >
              {item}
            </button>

          ))}

        </div>


        <div
          className="d-flex align-items-center gap-2"
        >

          <input
            type="text"
            className="form-control form-control-swu"
            placeholder="Search user, type..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            style={{
              minWidth: 240,
            }}
          />


          <button
            type="button"
            className="btn btn-swu-ghost d-flex align-items-center gap-2"
            onClick={loadEmergencies}
            disabled={loading}
          >

            <FiRefreshCw
              size={15}
            />

            Refresh

          </button>

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

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
          >
            Loading emergency records...
          </div>

        </div>

      )}


      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        filteredEmergencies.length === 0 && (

          <div
            className="glass glass-card text-center py-5"
          >

            <FiShield
              size={42}
              className="text-accent mb-3"
            />

            <h6 className="fw-bold">
              No Emergencies Found
            </h6>

            <p
              className="text-muted-swu mb-0"
              style={{
                fontSize: '0.85rem',
              }}
            >
              No emergency records match the current filters.
            </p>

          </div>

        )}


      {/* =====================================================
          EMERGENCIES
      ===================================================== */}

      {!loading &&
        filteredEmergencies.length > 0 && (

          <div className="d-flex flex-column gap-3">

            {filteredEmergencies.map(
              (emergency) => {

                const statusStyle =
                  getStatusStyle(
                    emergency.status
                  )


                return (

                  <div
                    key={emergency.id}
                    className="glass glass-card"
                  >

                    <div className="row g-4">


                      {/* =====================================
                          MAIN INFO
                      ===================================== */}

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
                                  'rgba(255, 77, 94, 0.10)',
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
                                {getEmergencyLabel(
                                  emergency.emergency_type
                                )}
                              </h6>

                              <div
                                className="text-muted-swu"
                                style={{
                                  fontSize:
                                    '0.75rem',
                                }}
                              >
                                Emergency #{emergency.id}
                              </div>

                            </div>

                          </div>


                          <span
                            className="px-3 py-1"
                            style={{
                              ...statusStyle,
                              borderRadius: 999,
                              fontSize:
                                '0.72rem',
                              fontWeight: 600,
                              textTransform:
                                'capitalize',
                            }}
                          >
                            {emergency.status ||
                              'Unknown'}
                          </span>

                        </div>


                        {/* User */}

                        <div
                          className="d-flex align-items-center gap-2 mb-2"
                          style={{
                            fontSize:
                              '0.84rem',
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
                            {emergency.username ||
                              emergency.user_username ||
                              emergency.user ||
                              'Unknown User'}
                          </span>

                        </div>


                        {/* Message */}

                        <div
                          className="mb-3"
                          style={{
                            fontSize:
                              '0.86rem',
                          }}
                        >

                          {emergency.message ||
                            'No emergency message provided.'}

                        </div>


                        {/* Created */}

                        <div
                          className="d-flex align-items-center gap-2 text-muted-swu"
                          style={{
                            fontSize:
                              '0.76rem',
                          }}
                        >

                          <FiClock
                            size={13}
                          />

                          Created:{' '}

                          {emergency.created_at
                            ? new Date(
                                emergency.created_at
                              ).toLocaleString()
                            : 'Unknown'}

                        </div>


                        {/* Resolved */}

                        {emergency.resolved_at && (

                          <div
                            className="d-flex align-items-center gap-2 text-muted-swu mt-2"
                            style={{
                              fontSize:
                                '0.76rem',
                            }}
                          >

                            <FiClock
                              size={13}
                            />

                            Resolved:{' '}

                            {new Date(
                              emergency.resolved_at
                            ).toLocaleString()}

                          </div>

                        )}

                      </div>


                      {/* =====================================
                          LOCATION
                      ===================================== */}

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

                            <span className="fw-bold">
                              Emergency Location
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

                              <div className="text-muted-swu">
                                Latitude
                              </div>

                              <div>
                                {emergency.latitude ??
                                  'Unavailable'}
                              </div>

                            </div>


                            <div>

                              <div className="text-muted-swu">
                                Longitude
                              </div>

                              <div>
                                {emergency.longitude ??
                                  'Unavailable'}
                              </div>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                )

              }
            )}

          </div>

        )}

    </DashboardLayout>

  )
}