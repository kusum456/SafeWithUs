import api from './api'


// ==================================================
// USER SAFETY ZONES
// ==================================================

export const getGeofences = async () => {

  const response = await api.get(
    '/geofence/'
  )

  return response.data
}


export const createGeofence = async (
  data
) => {

  const response = await api.post(
    '/geofence/',
    data
  )

  return response.data
}


export const updateGeofence = async (
  id,
  data
) => {

  const response = await api.patch(
    `/geofence/${id}/`,
    data
  )

  return response.data
}


export const deleteGeofence = async (
  id
) => {

  const response = await api.delete(
    `/geofence/${id}/`
  )

  return response.data
}


// ==================================================
// ADMIN SAFETY ZONES
// ==================================================

export const getAllGeofences = async () => {

  const response = await api.get(
    '/admin/geofences/'
  )

  return response.data
}