import api from './api'


// ============================================================
// USER → TRUSTED CONTACTS
// ============================================================

export const getGuardianUsers = async () => {

  const response = await api.get(
    '/guardian/users/'
  )

  return response.data
}


// ============================================================
// ALL TRUSTED CONTACTS
// ============================================================
// Used by Admin panel
// ============================================================

export const getAllTrustedContacts = async () => {

  const response = await api.get(
    '/guardian/users/'
  )

  return response.data
}


// ============================================================
// REGISTER TRUSTED CONTACT
// ============================================================

export const registerGuardianUser = async (
  userData
) => {

  const response = await api.post(
    '/guardian/users/register/',
    userData
  )

  return response.data
}


// ============================================================
// DELETE TRUSTED CONTACT
// ============================================================

export const deleteGuardianUser = async (
  userId
) => {

  const response = await api.delete(
    `/guardian/users/${userId}/`
  )

  return response.data
}


// ============================================================
// GUARDIAN → PROTECTED USERS
// ============================================================

export const getProtectedUsers = async () => {

  const response = await api.get(
    '/guardian/protected-users/'
  )

  return response.data
}


// ============================================================
// PROTECTED USER ALERTS
// ============================================================

export const getProtectedUserAlerts = async (
  userId
) => {

  const response = await api.get(
    `/guardian/protected-users/${userId}/alerts/`
  )

  return response.data
}


// ============================================================
// PROTECTED USER LOCATION
// ============================================================

export const getProtectedUserLocation = async (
  userId
) => {

  const response = await api.get(
    `/guardian/protected-users/${userId}/location/`
  )

  return response.data
}


// ============================================================
// PROTECTED USER EMERGENCIES
// ============================================================

export const getProtectedUserEmergencies = async (
  userId
) => {

  const response = await api.get(
    `/guardian/protected-users/${userId}/emergencies/`
  )

  return response.data
}


// ============================================================
// PROTECTED USER TRUSTED CONTACTS
// ============================================================

export const getProtectedUserTrustedContacts = async (
  userId
) => {

  const response = await api.get(
    `/guardian/protected-users/${userId}/trusted-contacts/`
  )

  return response.data
}