import api from './api'


// ==================================================
// USER LOCATION
// ==================================================

export const getCurrentLocation = async () => {

  const response = await api.get(
    '/tracking/location/'
  )

  return response.data
}


export const updateCurrentLocation = async (
  latitude,
  longitude
) => {

  const response = await api.put(
    '/tracking/location/',
    {
      latitude,
      longitude,
    }
  )

  return response.data
}


// ==================================================
// ADMIN - ALL USER LOCATIONS
// ==================================================

export const getAllLocations = async () => {

  const response = await api.get(
    '/admin/locations/'
  )

  return response.data
}