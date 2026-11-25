import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import Swal from 'sweetalert2'
import {
  FiPlus,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiUsers,
  FiTrash2,
} from 'react-icons/fi'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import ContactCard from '../../components/ContactCard.jsx'

import {
  getGuardianUsers,
  deleteGuardianUser,
  registerGuardianUser,
} from '../../services/guardianService.js'


// ============================================================
// RELATIONSHIP OPTIONS
// ============================================================

const relationshipOptions = [
  'Guardian',
  'Mother',
  'Father',
  'Parent',
  'Brother',
  'Sister',
  'Spouse',
  'Partner',
  'Friend',
  'Relative',
  'Colleague',
  'Teacher',
  'Doctor',
  'Neighbor',
  'Other',
]


// ============================================================
// PRIORITY OPTIONS
// ============================================================

const priorityOptions = [
  {
    value: 'Primary',
    label: 'Primary — Main emergency contact',
  },
  {
    value: 'Secondary',
    label: 'Secondary — Backup contact',
  },
  {
    value: 'Emergency',
    label: 'Emergency — Critical situations',
  },
]


// ============================================================
// USER TRUSTED CONTACTS
// ============================================================

export default function UserTrustedContacts() {

  const [contacts, setContacts] = useState([])

  const [loading, setLoading] = useState(true)

  const [show, setShow] = useState(false)

  const [editing, setEditing] = useState(null)

  const [saving, setSaving] = useState(false)


  // ==========================================================
  // FORMAT CONTACT
  // ==========================================================

  const formatContact = (contact) => {

    const name =
      contact.name ||
      contact.username ||
      'User'


    const initials =
      contact.initials ||
      name
        .split(' ')
        .map(
          (word) =>
            word[0]
        )
        .slice(0, 2)
        .join('')
        .toUpperCase()


    return {
      ...contact,

      name,

      initials,

      relation:
        contact.relationship ||
        'Trusted User',

      status:
        contact.status ||
        'offline',
    }

  }


  // ==========================================================
  // LOAD TRUSTED CONTACTS
  // ==========================================================

  const loadContacts = async () => {

    try {

      setLoading(true)

      const data =
        await getGuardianUsers()


      const contactData =
        Array.isArray(data)
          ? data
          : data?.results || []


      const formattedContacts =
        contactData.map(
          formatContact
        )


      setContacts(
        formattedContacts
      )

    } catch (error) {

      console.error(
        'Failed to load contacts:',
        error
      )


      Swal.fire({

        title:
          'Error',

        text:
          error.response?.data?.detail ||
          'Unable to load trusted contacts.',

        icon:
          'error',

        confirmButtonColor:
          '#26e0c9',

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

    loadContacts()

  }, [])


  // ==========================================================
  // OPEN ADD
  // ==========================================================

  const openAdd = () => {

    setEditing(null)

    setShow(true)

  }


  // ==========================================================
  // EDIT CONTACT
  // ==========================================================

  const openEdit = (
    contact
  ) => {

    setEditing(
      contact
    )


    Swal.fire({

      title:
        'Edit Contact',

      text:
        'Contact editing will be added after the registration flow is complete.',

      icon:
        'info',

      confirmButtonColor:
        '#26e0c9',

      background:
        'var(--bg-elevated)',

      color:
        'var(--text)',
    })

  }


  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {

    if (saving) {
      return
    }

    setShow(false)

    setEditing(null)

  }


  // ==========================================================
  // REGISTER CONTACT
  // ==========================================================

  const handleSave = async (
    event
  ) => {

    event.preventDefault()


    const form =
      new FormData(
        event.target
      )


    const userData = {

      name:
        form.get('name')?.trim(),

      username:
        form.get('username')?.trim(),

      email:
        form.get('email')?.trim(),

      phone:
        form.get('phone')?.trim(),

      password:
        form.get('password'),

      relationship:
        form.get('relationship'),

      priority:
        form.get('priority'),

    }


    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !userData.name
    ) {

      Swal.fire({

        title:
          'Name Required',

        text:
          'Please enter the contact name.',

        icon:
          'warning',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    if (
      !userData.username
    ) {

      Swal.fire({

        title:
          'Username Required',

        text:
          'Please enter a username.',

        icon:
          'warning',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    if (
      !userData.email
    ) {

      Swal.fire({

        title:
          'Email Required',

        text:
          'Please enter an email address.',

        icon:
          'warning',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    if (
      !userData.phone
    ) {

      Swal.fire({

        title:
          'Phone Required',

        text:
          'Please enter a phone number.',

        icon:
          'warning',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    if (
      !userData.password ||
      userData.password.length < 8
    ) {

      Swal.fire({

        title:
          'Invalid Password',

        text:
          'Password must contain at least 8 characters.',

        icon:
          'warning',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    if (
      !userData.relationship
    ) {

      Swal.fire({

        title:
          'Relationship Required',

        text:
          'Please select the relationship.',

        icon:
          'warning',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    if (
      !userData.priority
    ) {

      Swal.fire({

        title:
          'Priority Required',

        text:
          'Please select a priority.',

        icon:
          'warning',

        confirmButtonColor:
          '#26e0c9',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

      return

    }


    // ========================================================
    // REGISTER
    // ========================================================

    try {

      setSaving(true)


      const newContact =
        await registerGuardianUser(
          userData
        )


      const formattedContact =
        formatContact(
          newContact
        )


      setContacts(
        (current) => [
          ...current,
          formattedContact,
        ]
      )


      closeModal()


      event.target.reset()


      await Swal.fire({

        title:
          'Contact Registered',

        html:
          `<strong>${newContact.name || userData.name}</strong> has been registered and added to your trusted contacts.`,

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
        'Register trusted contact error:',
        error
      )


      const data =
        error.response?.data


      let message =
        'Unable to register trusted contact.'


      if (
        data?.email?.[0]
      ) {

        message =
          data.email[0]

      }

      else if (
        data?.username?.[0]
      ) {

        message =
          data.username[0]

      }

      else if (
        data?.password?.[0]
      ) {

        message =
          data.password[0]

      }

      else if (
        data?.phone?.[0]
      ) {

        message =
          data.phone[0]

      }

      else if (
        data?.name?.[0]
      ) {

        message =
          data.name[0]

      }

      else if (
        data?.relationship?.[0]
      ) {

        message =
          data.relationship[0]

      }

      else if (
        data?.priority?.[0]
      ) {

        message =
          data.priority[0]

      }

      else if (
        data?.detail
      ) {

        message =
          data.detail

      }


      Swal.fire({

        title:
          'Unable to Register',

        text:
          message,

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

      setSaving(false)

    }

  }


  // ==========================================================
  // DELETE CONTACT
  // ==========================================================

  const handleDelete = async (
    id
  ) => {

    const contact =
      contacts.find(
        (item) =>
          item.id === id
      )


    const result =
      await Swal.fire({

        title:
          'Remove this contact?',

        text:
          contact
            ? `${contact.name} will no longer be notified during an emergency.`
            : 'This contact will be removed from your trusted contacts.',

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


    try {

      await deleteGuardianUser(
        id
      )


      setContacts(
        (current) =>
          current.filter(
            (contact) =>
              contact.id !== id
          )
      )


      await Swal.fire({

        title:
          'Removed',

        text:
          'Trusted contact removed successfully.',

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
        'Delete contact error:',
        error
      )


      Swal.fire({

        title:
          'Error',

        text:
          error.response?.data?.detail ||
          'Unable to remove this contact.',

        icon:
          'error',

        confirmButtonColor:
          '#ff4d5e',

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',
      })

    }

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <DashboardLayout
      title="Trusted Contacts"
      subtitle="The people who get notified when it matters."
    >

      {/* ======================================================
          ADD BUTTON
      ====================================================== */}

      <div
        className="d-flex justify-content-end mb-4"
      >

        <button
          className="btn btn-swu-primary d-flex align-items-center gap-2"
          onClick={openAdd}
          type="button"
        >

          <FiPlus />

          Add Contact

        </button>

      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (

        <div
          className="text-center py-5 text-muted-swu"
        >

          Loading trusted contacts...

        </div>

      )}


      {/* ======================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        contacts.length === 0 && (

        <div
          className="glass glass-card text-center py-5"
        >

          <FiUsers
            size={45}
            className="text-accent mb-3"
          />

          <h6>
            No Trusted Contacts
          </h6>

          <p
            className="text-muted-swu mb-3"
            style={{
              fontSize:
                '0.85rem',
            }}
          >

            Add and register someone you trust for emergency notifications.

          </p>


          <button
            className="btn btn-swu-primary d-inline-flex align-items-center gap-2"
            onClick={openAdd}
            type="button"
          >

            <FiPlus />

            Add Contact

          </button>

        </div>

      )}


      {/* ======================================================
          CONTACTS
      ====================================================== */}

      {!loading &&
        contacts.length > 0 && (

        <div className="row g-4">

          {contacts.map(
            (contact) => (

              <div
                key={
                  contact.id
                }
                className="col-md-6 col-lg-4"
              >

                <ContactCard
                  contact={
                    contact
                  }
                  onEdit={
                    openEdit
                  }
                  onDelete={
                    handleDelete
                  }
                />

              </div>

            )
          )}

        </div>

      )}


      {/* ======================================================
          ADD CONTACT MODAL
      ====================================================== */}

      <Modal
        show={show}
        onHide={closeModal}
        centered
        size="md"
        backdrop="static"
        contentClassName="glass-strong border-0"
      >

        <form
          onSubmit={
            handleSave
          }
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <Modal.Header
            closeButton
            closeVariant="white"
            className="border-0"
          >

            <Modal.Title
              className="font-display fw-bold"
              style={{
                fontSize:
                  '1.1rem',
              }}
            >

              Add & Register Trusted Contact

            </Modal.Title>

          </Modal.Header>


          {/* ==================================================
              BODY
          ================================================== */}

          <Modal.Body>

            {/* =================================================
                CONTACT INFORMATION
            ================================================= */}

            <div
              className="mb-3"
            >

              <div
                className="d-flex align-items-center gap-2 mb-3"
              >

                <FiUser
                  className="text-accent"
                  size={16}
                />

                <span
                  className="fw-semibold"
                >
                  Contact Information
                </span>

              </div>


              {/* FULL NAME */}

              <div className="mb-3">

                <label
                  className="form-label text-muted-swu"
                  style={{
                    fontSize:
                      '0.85rem',
                  }}
                >

                  Full Name

                </label>


                <input
                  required
                  name="name"
                  type="text"
                  className="form-control form-control-swu"
                  placeholder="Rahul Kumar"
                  autoComplete="name"
                />

              </div>


              <div className="row g-3">

                {/* USERNAME */}

                <div className="col-md-6">

                  <label
                    className="form-label text-muted-swu"
                    style={{
                      fontSize:
                        '0.85rem',
                    }}
                  >

                    Username

                  </label>


                  <input
                    required
                    name="username"
                    type="text"
                    className="form-control form-control-swu"
                    placeholder="rahul"
                    autoComplete="username"
                  />

                </div>


                {/* PHONE */}

                <div className="col-md-6">

                  <label
                    className="form-label text-muted-swu"
                    style={{
                      fontSize:
                        '0.85rem',
                    }}
                  >

                    Phone Number

                  </label>


                  <input
                    required
                    name="phone"
                    type="tel"
                    className="form-control form-control-swu"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="mt-3">

                <label
                  className="form-label text-muted-swu"
                  style={{
                    fontSize:
                      '0.85rem',
                  }}
                >

                  Email Address

                </label>


                <div
                  className="input-group"
                >

                  <span
                    className="input-group-text"
                    style={{
                      background:
                        'var(--surface-strong)',
                      border:
                        '1px solid var(--border-soft)',
                      color:
                        'var(--text-muted)',
                    }}
                  >

                    <FiMail
                      size={14}
                    />

                  </span>


                  <input
                    required
                    type="email"
                    name="email"
                    className="form-control form-control-swu"
                    placeholder="rahul@gmail.com"
                    autoComplete="email"
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                ACCOUNT SETUP
            ================================================= */}

            <div
              className="mb-4 pt-2"
            >

              <div
                className="d-flex align-items-center gap-2 mb-3"
              >

                <FiShield
                  className="text-accent"
                  size={16}
                />

                <span
                  className="fw-semibold"
                >
                  Account Setup
                </span>

              </div>


              <label
                className="form-label text-muted-swu"
                style={{
                  fontSize:
                    '0.85rem',
                }}
              >

                Password

              </label>


              <input
                required
                type="password"
                name="password"
                minLength={8}
                className="form-control form-control-swu"
                placeholder="Create password"
                autoComplete="new-password"
              />


              <div
                className="text-muted-swu mt-2"
                style={{
                  fontSize:
                    '0.7rem',
                }}
              >

                Minimum 8 characters.

              </div>

            </div>


            {/* =================================================
                RELATIONSHIP & PRIORITY
            ================================================= */}

            <div>

              <div
                className="d-flex align-items-center gap-2 mb-3"
              >

                <FiUsers
                  className="text-accent"
                  size={16}
                />

                <span
                  className="fw-semibold"
                >
                  Trust & Safety
                </span>

              </div>


              {/* RELATIONSHIP */}

              <div className="mb-3">

                <label
                  className="form-label text-muted-swu"
                  style={{
                    fontSize:
                      '0.85rem',
                  }}
                >

                  Relationship

                </label>


                <select
                  required
                  name="relationship"
                  defaultValue=""
                  className="form-control form-control-swu"
                >

                  <option
                    value=""
                    disabled
                  >
                    Select relationship
                  </option>


                  {relationshipOptions.map(
                    (relationship) => (

                      <option
                        key={
                          relationship
                        }
                        value={
                          relationship
                        }
                      >

                        {relationship}

                      </option>

                    )
                  )}

                </select>


                <div
                  className="text-muted-swu mt-2"
                  style={{
                    fontSize:
                      '0.7rem',
                  }}
                >

                  Select how this person is connected to you.

                </div>

              </div>


              {/* PRIORITY */}

              <div
                className="mb-1"
              >

                <label
                  className="form-label text-muted-swu"
                  style={{
                    fontSize:
                      '0.85rem',
                  }}
                >

                  Emergency Priority

                </label>


                <select
                  required
                  name="priority"
                  defaultValue="Primary"
                  className="form-control form-control-swu"
                >

                  {priorityOptions.map(
                    (option) => (

                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >

                        {option.label}

                      </option>

                    )
                  )}

                </select>

              </div>

            </div>

          </Modal.Body>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <Modal.Footer
            className="border-0"
          >

            <button
              type="button"
              className="btn btn-swu-ghost"
              onClick={
                closeModal
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

                  Registering...

                </>

              ) : (

                'Register & Add'

              )}

            </button>

          </Modal.Footer>

        </form>

      </Modal>

    </DashboardLayout>

  )

}