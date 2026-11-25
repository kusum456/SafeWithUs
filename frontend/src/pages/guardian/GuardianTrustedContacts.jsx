import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  FiUsers,
  FiUser,
  FiShield,
  FiPhone,
  FiMail,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi'

import Swal from 'sweetalert2'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'

import {
  getProtectedUsers,
  getProtectedUserTrustedContacts,
} from '../../services/guardianService.js'


export default function GuardianTrustedContacts() {

  const [users, setUsers] = useState([])

  const [contacts, setContacts] = useState([])

  const [selectedUserId, setSelectedUserId] =
    useState('')

  const [query, setQuery] = useState('')

  const [loadingUsers, setLoadingUsers] =
    useState(true)

  const [loadingContacts, setLoadingContacts] =
    useState(false)

  const [error, setError] = useState('')


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

        setSelectedUserId(
          String(
            firstUser.user ||
            firstUser.id
          )
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
  // LOAD TRUSTED CONTACTS
  // ==========================================================

  const loadContacts = async (
    userId = selectedUserId
  ) => {

    if (!userId) {

      setContacts([])

      return

    }

    try {

      setLoadingContacts(true)
      setError('')

      const data =
        await getProtectedUserTrustedContacts(
          userId
        )

      const contactData =
        Array.isArray(data)
          ? data
          : data?.results || []

      setContacts(contactData)

    } catch (err) {

      console.error(
        'Failed to load trusted contacts:',
        err
      )

      setError(
        err.response?.data?.detail ||
        'Unable to load trusted contacts.'
      )

      setContacts([])

    } finally {

      setLoadingContacts(false)

    }

  }


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadProtectedUsers()

  }, [])


  // ==========================================================
  // LOAD CONTACTS WHEN USER CHANGES
  // ==========================================================

  useEffect(() => {

    if (selectedUserId) {

      loadContacts(
        selectedUserId
      )

    }

  }, [
    selectedUserId,
  ])


  // ==========================================================
  // GET CURRENT PROTECTED USER
  // ==========================================================

  const selectedUser =
    users.find(
      (user) =>
        String(
          user.user ||
          user.id
        ) === String(
          selectedUserId
        )
    )


  const selectedUserName =
    selectedUser?.user_name ||
    selectedUser?.username ||
    selectedUser?.name ||
    `User ${selectedUserId}`


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredContacts =
    useMemo(() => {

      const search =
        query.toLowerCase().trim()

      if (!search) {
        return contacts
      }

      return contacts.filter(
        (contact) => {

          const name =
            String(
              contact.name ||
              contact.username ||
              contact.user_name ||
              ''
            ).toLowerCase()

          const email =
            String(
              contact.email ||
              ''
            ).toLowerCase()

          const relationship =
            String(
              contact.relationship ||
              ''
            ).toLowerCase()

          return (
            name.includes(search) ||
            email.includes(search) ||
            relationship.includes(search)
          )

        }
      )

    }, [
      contacts,
      query,
    ])


  // ==========================================================
  // HELPER
  // ==========================================================

  const getContactName = (
    contact
  ) => {

    return (
      contact.name ||
      contact.username ||
      contact.user_name ||
      'Trusted Contact'
    )

  }


  const getInitials = (
    contact
  ) => {

    const name =
      getContactName(
        contact
      )

    return name
      .split(' ')
      .map(
        (word) =>
          word[0]
      )
      .slice(0, 2)
      .join('')
      .toUpperCase()

  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <DashboardLayout
      title="Trusted Contacts"
      subtitle="View the trusted contacts of your protected users."
    >

      {/* ======================================================
          USER SELECTOR
      ====================================================== */}

      <div
        className="glass glass-card mb-4"
      >

        <div
          className="d-flex flex-wrap align-items-center justify-content-between gap-3"
        >

          <div>

            <h6
              className="mb-1 d-flex align-items-center gap-2"
            >

              <FiShield
                className="text-accent"
              />

              Protected User

            </h6>

            <div
              className="text-muted-swu"
              style={{
                fontSize:
                  '0.74rem',
              }}
            >

              View their trusted contacts except your own guardian account.

            </div>

          </div>


          <div
            className="d-flex align-items-center gap-2"
          >

            <select
              className="form-select form-control-swu"
              value={selectedUserId}
              onChange={(e) =>
                setSelectedUserId(
                  e.target.value
                )
              }
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
                loadContacts(
                  selectedUserId
                )
              }
              disabled={
                loadingContacts ||
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
            className="text-danger-swu"
            style={{
              fontSize:
                '0.82rem',
            }}
          >

            {error}

          </div>

        </div>

      )}


      {/* ======================================================
          SEARCH
      ====================================================== */}

      {!loadingUsers &&
        users.length > 0 && (

        <div
          className="d-flex justify-content-end mb-4"
        >

          <div
            className="position-relative"
            style={{
              minWidth: 270,
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
              placeholder="Search contacts..."
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
            />

          </div>

        </div>

      )}


      {/* ======================================================
          LOADING
      ====================================================== */}

      {(loadingUsers ||
        loadingContacts) && (

        <div
          className="glass glass-card text-center py-5"
        >

          <div
            className="spinner-border"
            role="status"
            style={{
              color:
                '#26e0c9',
            }}
          />

          <div
            className="text-muted-swu mt-3"
            style={{
              fontSize:
                '0.82rem',
            }}
          >

            Loading trusted contacts...

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
              fontSize:
                '0.82rem',
            }}
          >

            You don't have any protected users yet.

          </p>

        </div>

      )}


      {/* ======================================================
          CONTACTS
      ====================================================== */}

      {!loadingUsers &&
        !loadingContacts &&
        users.length > 0 &&
        filteredContacts.length > 0 && (

        <>

          {/* Header */}

          <div
            className="d-flex align-items-center justify-content-between mb-3"
          >

            <div>

              <h6 className="mb-1">

                {selectedUserName}'s Trusted Contacts

              </h6>

              <div
                className="text-muted-swu"
                style={{
                  fontSize:
                    '0.72rem',
                }}
              >

                {filteredContacts.length}{' '}
                contact
                {filteredContacts.length !== 1
                  ? 's'
                  : ''}

              </div>

            </div>

          </div>


          <div className="row g-4">

            {filteredContacts.map(
              (contact) => {

                const name =
                  getContactName(
                    contact
                  )

                const isGuardian =
                  Boolean(
                    contact.is_current_guardian
                  )


                return (

                  <div
                    key={
                      contact.id ||
                      `${contact.email}-${contact.username}`
                    }
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
                          className="d-flex align-items-center justify-content-center font-mono"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius:
                              '50%',
                            background:
                              'var(--surface-strong)',
                            fontSize:
                              '0.76rem',
                            fontWeight:
                              700,
                          }}
                        >

                          {getInitials(
                            contact
                          )}

                        </div>


                        {isGuardian ? (

                          <span
                            className="text-muted-swu"
                            style={{
                              fontSize:
                                '0.68rem',
                            }}
                          >
                            Current Guardian
                          </span>

                        ) : (

                          <span
                            className="status-dot on"
                          />

                        )}

                      </div>


                      {/* Name */}

                      <h6 className="fw-bold mb-1">

                        {name}

                      </h6>


                      {/* Relationship */}

                      <div
                        className="text-accent mb-3"
                        style={{
                          fontSize:
                            '0.78rem',
                        }}
                      >

                        {contact.relationship ||
                          'Trusted Contact'}

                      </div>


                      {/* Email */}

                      {contact.email && (

                        <div
                          className="d-flex align-items-center gap-2 py-2"
                          style={{
                            borderBottom:
                              '1px solid var(--border-soft)',
                            fontSize:
                              '0.78rem',
                          }}
                        >

                          <FiMail
                            className="text-muted-swu"
                            size={13}
                          />

                          <span>
                            {contact.email}
                          </span>

                        </div>

                      )}


                      {/* Phone */}

                      {contact.phone && (

                        <div
                          className="d-flex align-items-center gap-2 py-2"
                          style={{
                            borderBottom:
                              '1px solid var(--border-soft)',
                            fontSize:
                              '0.78rem',
                          }}
                        >

                          <FiPhone
                            className="text-muted-swu"
                            size={13}
                          />

                          <span>
                            {contact.phone}
                          </span>

                        </div>

                      )}


                      {/* Priority */}

                      <div
                        className="d-flex align-items-center justify-content-between pt-2"
                        style={{
                          fontSize:
                            '0.76rem',
                        }}
                      >

                        <span
                          className="text-muted-swu"
                        >
                          Priority
                        </span>

                        <span
                          className="text-accent"
                        >
                          {contact.priority ||
                            'Primary'}
                        </span>

                      </div>

                    </div>

                  </div>

                )

              }
            )}

          </div>

        </>

      )}


      {/* ======================================================
          EMPTY CONTACTS
      ====================================================== */}

      {!loadingUsers &&
        !loadingContacts &&
        users.length > 0 &&
        filteredContacts.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >

          <FiUser
            size={44}
            className="text-accent mb-3"
          />

          <h6 className="fw-bold">
            No Other Trusted Contacts
          </h6>

          <p
            className="text-muted-swu mb-0"
            style={{
              fontSize:
                '0.82rem',
            }}
          >

            {query
              ? 'No contacts match your search.'
              : 'This protected user has no other trusted contacts.'}

          </p>

        </div>

      )}

    </DashboardLayout>

  )
}