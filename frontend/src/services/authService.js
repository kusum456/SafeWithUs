import api from './api'


// ============================================================
// REGISTER
// ============================================================

export const registerUser = async (userData) => {

  const response = await api.post(
    '/accounts/register/',
    userData
  )

  return response.data
}


// ============================================================
// LOGIN
// ============================================================

export const loginUser = async (
  email,
  password
) => {

  // Clear previous account session
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userProfile')
  localStorage.removeItem('userRole')


  const response = await api.post(
    '/accounts/login/',
    {
      email: email.trim().toLowerCase(),
      password,
    }
  )


  // Save tokens
  localStorage.setItem(
    'accessToken',
    response.data.access
  )

  localStorage.setItem(
    'refreshToken',
    response.data.refresh
  )


  // Save user returned by backend
  if (response.data.user) {

    localStorage.setItem(
      'userProfile',
      JSON.stringify(
        response.data.user
      )
    )

    localStorage.setItem(
      'userRole',
      response.data.user.role
    )
  }


  return response.data
}


// ============================================================
// GET PROFILE
// ============================================================

export const getProfile = async () => {

  const response = await api.get(
    '/accounts/profile/'
  )

  return response.data
}


// ============================================================
// LOGOUT
// ============================================================

export const logoutUser = () => {

  localStorage.removeItem(
    'accessToken'
  )

  localStorage.removeItem(
    'refreshToken'
  )

  localStorage.removeItem(
    'userProfile'
  )

  localStorage.removeItem(
    'userRole'
)

}