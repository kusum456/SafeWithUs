import React, { useEffect, useMemo, useState } from 'react'
import {
  FiUsers,
  FiShield,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiClock,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import {
  getAllTrustedContacts,
} from '../../services/guardianService.js'


export default function AdminTrustedContacts() {

  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')


  // ==========================================================
  // LOAD ALL TRUSTED CONTACT RELATIONSHIPS
  // ==========================================================

  const loadContacts = async () => {

    try {

      setLoading(true)

      const data =
        await getAllTrustedContacts()

      setContacts(
        Array.isArray(data)
          ? data
          : data?.results || []
      )

    } catch (error) {

      console.error(
        'Admin trusted contacts error:',
        error
      )

      Swal.fire({
        title: 'Unable to Load Trusted Contacts',
        text:
          error.response?.data?.detail ||
          'Unable to load guardian relationships.',
        icon: 'error',
        background: 'var(--bg-elevated)',
        color: 'var(--text)',
      })

    } finally {

      setLoading(false)

    }
  }


  useEffect(() => {

    loadContacts()

  }, [])


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredContacts = useMemo(() => {

    const search =
      query.toLowerCase().trim()


    if (!search) {
      return contacts
    }


    return contacts.filter((contact) => {

      const userName =
        String(
          contact.protected_user_name ||
          contact.user_name ||
          contact.user_username ||
          contact.user ||
          ''
        ).toLowerCase()


      const guardianName =
        String(
          contact.guardian_name ||
          contact.guardian_username ||
          contact.guardian_user_name ||
          contact.guardian ||
          ''
        ).toLowerCase()


      const relationship =
        String(
          contact.relationship ||
          ''
        ).toLowerCase()


      const priority =
        String(
          contact.priority ||
          ''
        ).toLowerCase()


      return (
        userName.includes(search) ||
        guardianName.includes(search) ||
        relationship.includes(search) ||
        priority.includes(search)
      )

    })

  }, [contacts, query])


  // ==========================================================
  // UNIQUE USERS
  // ==========================================================

  const userCount = useMemo(() => {

    return new Set(
      contacts.map(
        (contact) =>
          contact.user
      )
    ).size

  }, [contacts])


  // ==========================================================
  // UNIQUE GUARDIANS
  // ==========================================================

  const guardianCount = useMemo(() => {

    return new Set(
      contacts.map(
        (contact) =>
          contact.guardian
      ).size

    )

  }, [contacts])


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


  return (

    <DashboardLayout
      title="Trusted Contacts"
      subtitle="Monitor User and Guardian relationships across SafeWithUs."
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
              Total Relationships
            </div>

            <div
              className="font-mono fw-bold text-accent"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {contacts.length}
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
              Protected Users
            </div>

            <div
              className="font-mono fw-bold"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {userCount}
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
              Guardians
            </div>

            <div
              className="font-mono fw-bold"
              style={{
                fontSize: '1.8rem',
              }}
            >
              {guardianCount}
            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          SEARCH + REFRESH
      ====================================================== */}

      <div
        className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >

        <div
          className="position-relative"
          style={{
            minWidth: 280,
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
            placeholder="Search user, guardian..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
          />

        </div>


        <button
          type="button"
          className="btn btn-swu-ghost d-flex align-items-center gap-2"
          onClick={loadContacts}
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
            role="status"
            style={{
              color: '#26e0c9',
            }}
          />

          <div
            className="text-muted-swu mt-3"
            style={{
              fontSize: '0.85rem',
            }}
          >
            Loading trusted-contact relationships...
          </div>

        </div>

      )}


      {/* ======================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        filteredContacts.length === 0 && (

          <div
            className="glass glass-card text-center py-5"
          >

            <FiUsers
              size={45}
              className="text-accent mb-3"
            />

            <h6 className="fw-bold">
              No Trusted Contacts
            </h6>

            <p
              className="text-muted-swu mb-0"
              style={{
                fontSize: '0.85rem',
              }}
            >
              {query
                ? 'No relationships match your search.'
                : 'No User-Guardian relationships have been created yet.'}
            </p>

          </div>

        )}


      {/* ======================================================
          RELATIONSHIPS
      ====================================================== */}

      {!loading &&
        filteredContacts.length > 0 && (

          <div className="row g-4">

            {filteredContacts.map(
              (contact) => (

                <div
                  key={contact.id}
                  className="col-md-6 col-xl-4"
                >

                  <div
                    className="glass glass-card h-100"
                  >

                    {/* Header */}

                    <div
                      className="d-flex align-items-center justify-content-between mb-3"
                    >

                      <div
                        className="d-flex align-items-center gap-2"
                      >

                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background:
                              'var(--surface-strong)',
                          }}
                        >

                          <FiShield
                            className="text-accent"
                            size={18}
                          />

                        </div>


                        <div>

                          <div
                            className="fw-semibold"
                            style={{
                              fontSize:
                                '0.85rem',
                            }}
                          >
                            Guardian Relationship
                          </div>

                          <div
                            className="text-muted-swu"
                            style={{
                              fontSize:
                                '0.68rem',
                            }}
                          >
                            ID #{contact.id}
                          </div>

                        </div>

                      </div>


                      <span
                        className="status-dot on"
                      />

                    </div>


                    {/* Protected User */}

                    <div
                      className="mb-3 p-3"
                      style={{
                        borderRadius: 12,
                        background:
                          'var(--surface-strong)',
                      }}
                    >

                      <div
                        className="d-flex align-items-center gap-2 mb-2"
                      >

                        <FiUser
                          className="text-accent"
                          size={15}
                        />

                        <span
                          className="text-muted-swu"
                          style={{
                            fontSize:
                              '0.72rem',
                          }}
                        >
                          Protected User
                        </span>

                      </div>


                      <div
                        className="fw-semibold"
                        style={{
                          fontSize:
                            '0.9rem',
                        }}
                      >

                        {contact.protected_user_name ||
                          contact.user_name ||
                          contact.user_username ||
                          contact.user ||
                          'Unknown User'}

                      </div>

                    </div>


                    {/* Guardian */}

                    <div
                      className="mb-3 p-3"
                      style={{
                        borderRadius: 12,
                        background:
                          'var(--surface-strong)',
                      }}
                    >

                      <div
                        className="d-flex align-items-center gap-2 mb-2"
                      >

                        <FiShield
                          className="text-accent"
                          size={15}
                        />

                        <span
                          className="text-muted-swu"
                          style={{
                            fontSize:
                              '0.72rem',
                          }}
                        >
                          Guardian
                        </span>

                      </div>


                      <div
                        className="fw-semibold"
                        style={{
                          fontSize:
                            '0.9rem',
                        }}
                      >

                        {contact.guardian_name ||
                          contact.guardian_username ||
                          contact.guardian_user_name ||
                          contact.guardian ||
                          'Unknown Guardian'}

                      </div>

                    </div>


                    {/* Relationship */}

                    <div
                      className="d-flex justify-content-between py-2"
                      style={{
                        borderBottom:
                          '1px solid var(--border-soft)',
                        fontSize:
                          '0.8rem',
                      }}
                    >

                      <span className="text-muted-swu">
                        Relationship
                      </span>

                      <span>
                        {contact.relationship ||
                          'Trusted User'}
                      </span>

                    </div>


                    {/* Priority */}

                    <div
                      className="d-flex justify-content-between py-2"
                      style={{
                        borderBottom:
                          '1px solid var(--border-soft)',
                        fontSize:
                          '0.8rem',
                      }}
                    >

                      <span className="text-muted-swu">
                        Priority
                      </span>

                      <span
                        className="text-accent"
                      >
                        {contact.priority ||
                          'Primary'}
                      </span>

                    </div>


                    {/* Created */}

                    <div
                      className="d-flex align-items-center gap-2 text-muted-swu pt-2"
                      style={{
                        fontSize:
                          '0.7rem',
                      }}
                    >

                      <FiClock
                        size={12}
                      />

                      {formatDate(
                        contact.created_at
                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

    </DashboardLayout>

  )
}