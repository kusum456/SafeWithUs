import api from './api'

export const getAdminDashboard = async () => {
  const response = await api.get(
    '/adminpanel/dashboard/'
  )

  return response.data
}

export const getAdminAlerts = async () => {
  const response = await api.get(
    '/adminpanel/alerts/'
  )

  return response.data
}

export const getAdminUsers = async () => {
  const response = await api.get(
    '/adminpanel/users/'
  )

  return response.data
}

export const getAdminGuardians = async () => {
  const response = await api.get(
    '/adminpanel/guardians/'
  )

  return response.data
}

export const getAdminTrustedContacts = async () => {
  const response = await api.get(
    '/adminpanel/trusted-contacts/'
  )

  return response.data
}

export const getAdminEmergencies = async () => {
  const response = await api.get(
    '/adminpanel/emergencies/'
  )

  return response.data
}