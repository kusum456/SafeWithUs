import React, { useEffect, useMemo, useState } from 'react'
import {
  FiSearch,
  FiRefreshCw,
  FiAlertTriangle,
  FiMapPin,
  FiUser,
  FiShield,
  FiClock,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import {
  getAllAlerts,
} from '../../services/alertService.js'


const categories = [
  'All',
  'Safety',
  'Emergency',
  'Location',
  'System',
]


export default function AdminAlerts() {

  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)


  // =====================================================
  // LOAD ALL ALERTS
  // =====================================================

  const loadAlerts = async () => {

    try {

      setLoading(true)

      const data = await getAllAlerts()

      setAlerts(
        Array.isArray(data)
          ? data
          : data.results || []
      )

    } catch (error) {

      console.error(
        'Failed to load admin alerts:',
        error
      )

      Swal.fire({
        title: 'Unable to Load Alerts',
        text:
          error.response?.data?.detail ||
          'Something went wrong while loading alerts.',
        icon: 'error',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {

    loadAlerts()

  }, [])


  // =====================================================
  // FILTER
  // =====================================================

  const filteredAlerts = useMemo(() => {

    const search =
      query.toLowerCase().trim()


    return alerts.filter((alert) => {

      const category =
        alert.category ||
        'Safety'


      const matchesCategory =
        filter === 'All' ||
        category === filter


      const userText =
        String(
          alert.user ||
          alert.username ||
          ''
        )


      const message =
        String(
          alert.message ||
          ''
        )


      const geofence =
        String(
          alert.geofence ||
          ''
        )


      const matchesSearch =
        !search ||
        userText
          .toLowerCase()
          .includes(search) ||
        message
          .toLowerCase()
          .includes(search) ||
        geofence
          .toLowerCase()
          .includes(search)


      return (
        matchesCategory &&
        matchesSearch
      )

    })

  }, [
    alerts,
    filter,
    query,
  ])


  // =====================================================
  // UI
  // =====================================================

  return (

    <DashboardLayout
      title="Alerts"
      subtitle="Monitor safety alerts generated across the SafeWithUs system."
    >

      {/* =================================================
          TOP CONTROLS
      ================================================= */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >

        {/* FILTERS */}

        <div className="d-flex flex-wrap gap-2">

          {categories.map((category) => (

            <button
              key={category}
              type="button"
              className="btn btn-sm"
              onClick={() =>
                setFilter(category)
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

          ))}

        </div>


        {/* SEARCH + REFRESH */}

        <div
          className="d-flex align-items-center gap-2"
        >

          <div
            className="position-relative"
            style={{
              minWidth: 250,
            }}
          >

            <FiSearch
              className="position-absolute text-faint-swu"
              style={{
                top: 11,
                left: 12,
              }}
              size={15}
            />

            <input
              className="form-control form-control-swu ps-5"
              placeholder="Search user or alert..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              style={{
                padding:
                  '0.45rem 1rem',
              }}
            />

          </div>


          <button
            type="button"
            className="btn btn-swu-ghost d-flex align-items-center gap-2"
            onClick={loadAlerts}
            disabled={loading}
          >

            <FiRefreshCw
              size={15}
            />

            Refresh

          </button>

        </div>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

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
              fontSize: '0.85rem',
            }}
          >
            Loading system alerts...
          </div>

        </div>

      )}


      {/* =================================================
          EMPTY
      ================================================= */}

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
              No Alerts Found
            </h6>

            <p
              className="text-muted-swu mb-0"
              style={{
                fontSize: '0.85rem',
              }}
            >
              {query ||
              filter !== 'All'
                ? 'No alerts match your filters.'
                : 'There are currently no alerts in the system.'}
            </p>

          </div>

        )}


      {/* =================================================
          ALERT LIST
      ================================================= */}

      {!loading &&
        filteredAlerts.length > 0 && (

          <div className="d-flex flex-column gap-3">

            {filteredAlerts.map((alert) => (

              <div
                key={alert.id}
                className="glass glass-card"
              >

                <div className="row g-4">


                  {/* =====================================
                      ALERT INFORMATION
                  ===================================== */}

                  <div className="col-lg-8">

                    <div
                      className="d-flex align-items-center gap-2 mb-2"
                    >

                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background:
                            'var(--surface-strong)',
                        }}
                      >

                        <FiAlertTriangle
                          className="text-accent"
                          size={18}
                        />

                      </div>


                      <div>

                        <h6 className="fw-bold mb-0">
                          Safety Alert
                        </h6>

                        <div
                          className="text-muted-swu"
                          style={{
                            fontSize:
                              '0.75rem',
                          }}
                        >
                          Alert #{alert.id}
                        </div>

                      </div>

                    </div>


                    {/* Message */}

                    <div
                      className="mb-3"
                      style={{
                        fontSize:
                          '0.9rem',
                      }}
                    >
                      {alert.message ||
                        'No alert message'}
                    </div>


                    {/* User */}

                    <div
                      className="d-flex align-items-center gap-2 mb-2 text-muted-swu"
                      style={{
                        fontSize:
                          '0.8rem',
                      }}
                    >

                      <FiUser size={14} />

                      <span>
                        User:
                      </span>

                      <span className="text-accent">
                        {alert.username ||
                          alert.user ||
                          'Unknown User'}
                      </span>

                    </div>


                    {/* Geofence */}

                    <div
                      className="d-flex align-items-center gap-2 mb-2 text-muted-swu"
                      style={{
                        fontSize:
                          '0.8rem',
                      }}
                    >

                      <FiShield size={14} />

                      <span>
                        Safe Zone:
                      </span>

                      <span>
                        {alert.geofence_name ||
                          alert.geofence ||
                          'Unknown'}
                      </span>

                    </div>


                    {/* Created */}

                    <div
                      className="d-flex align-items-center gap-2 text-muted-swu"
                      style={{
                        fontSize:
                          '0.8rem',
                      }}
                    >

                      <FiClock size={14} />

                      <span>
                        {alert.created_at
                          ? new Date(
                              alert.created_at
                            ).toLocaleString()
                          : 'Unknown time'}
                      </span>

                    </div>

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
                          Alert Location
                        </span>

                      </div>


                      <div
                        className="font-mono"
                        style={{
                          fontSize:
                            '0.8rem',
                        }}
                      >

                        <div className="mb-2">

                          <span className="text-muted-swu">
                            Latitude
                          </span>

                          <div>
                            {alert.latitude ??
                              'Not available'}
                          </div>

                        </div>


                        <div>

                          <span className="text-muted-swu">
                            Longitude
                          </span>

                          <div>
                            {alert.longitude ??
                              'Not available'}
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

    </DashboardLayout>

  )

}