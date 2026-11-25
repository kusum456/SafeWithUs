import React, {
  useState,
  useEffect,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import Swal from 'sweetalert2'

import {
  loginUser,
  getProfile,
} from '../services/authService'

import {
  FiShield,
  FiArrowRight,
} from 'react-icons/fi'

import {
  FcGoogle,
} from 'react-icons/fc'

import SafetyShield
  from '../components/SafetyShield.jsx'

import ParticleBackground
  from '../components/ParticleBackground.jsx'


export default function Login() {

  const navigate = useNavigate()


  // ============================================================
  // FORM STATE
  // ============================================================

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  const [rememberMe, setRememberMe] =
    useState(false)


  // ============================================================
  // UI STATE
  // ============================================================

  const [errors, setErrors] =
    useState({})

  const [loading, setLoading] =
    useState(false)


  // ============================================================
  // CLEAR LOGIN FORM
  // ============================================================

  useEffect(() => {

    // Do NOT load previous email/password
    // automatically.

    setEmail('')
    setPassword('')

  }, [])


  // ============================================================
  // ROLE REDIRECT
  // ============================================================

  const redirectByRole = (
    role
  ) => {

    const normalizedRole =
      String(
        role || ''
      )
        .toLowerCase()
        .trim()


    console.log(
      'FINAL REDIRECT ROLE:',
      normalizedRole
    )


    // ==========================================================
    // ADMIN
    // ==========================================================

    if (
      normalizedRole === 'admin'
    ) {

      navigate(
        '/admin/dashboard',
        {
          replace: true,
        }
      )

      return
    }


    // ==========================================================
    // GUARDIAN
    // ==========================================================

    if (
      normalizedRole === 'guardian'
    ) {

      navigate(
        '/guardian/dashboard',
        {
          replace: true,
        }
      )

      return
    }


    // ==========================================================
    // NORMAL USER
    // ==========================================================

    navigate(
      '/dashboard',
      {
        replace: true,
      }
    )

  }


  // ============================================================
  // SUBMIT LOGIN
  // ============================================================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault()


    // ==========================================================
    // CLEAN INPUT
    // ==========================================================

    const cleanEmail =
      email
        .trim()
        .toLowerCase()

    const cleanPassword =
      password


    // ==========================================================
    // VALIDATION
    // ==========================================================

    const nextErrors = {}


    if (!cleanEmail) {

      nextErrors.email =
        'Email is required'

    }

    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {

      nextErrors.email =
        'Enter a valid email address'

    }


    if (!cleanPassword) {

      nextErrors.password =
        'Password is required'

    }

    else if (
      cleanPassword.length < 4
    ) {

      nextErrors.password =
        'Enter a valid password'

    }


    setErrors(
      nextErrors
    )


    if (
      Object.keys(
        nextErrors
      ).length > 0
    ) {

      return

    }


    try {

      setLoading(true)


      // ========================================================
      // CLEAR OLD SESSION
      // ========================================================

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


      // ========================================================
      // LOGIN
      // ========================================================

      console.log(
        'LOGIN EMAIL:',
        cleanEmail
      )


      const loginResponse =
        await loginUser(
          cleanEmail,
          cleanPassword
        )


      console.log(
        'LOGIN RESPONSE:',
        loginResponse
      )


      // ========================================================
      // MAKE SURE TOKEN EXISTS
      // ========================================================

      if (
        !loginResponse?.access
      ) {

        throw new Error(
          'Login succeeded but no access token was received.'
        )

      }


      // ========================================================
      // GET AUTHENTICATED USER PROFILE
      // ========================================================
      //
      // IMPORTANT:
      // We do NOT determine the role from the email.
      //
      // We get the role from Django for the
      // currently authenticated account.
      //
      // ========================================================

      const profile =
        await getProfile()


      console.log(
        'AUTHENTICATED PROFILE:',
        profile
      )


      if (!profile) {

        throw new Error(
          'Unable to load your account profile.'
        )

      }


      // ========================================================
      // GET ROLE FROM PROFILE
      // ========================================================

      const role =
        String(
          profile?.role || 'user'
        )
          .toLowerCase()
          .trim()


      console.log(
        'AUTHENTICATED USER:',
        profile?.username
      )

      console.log(
        'AUTHENTICATED EMAIL:',
        profile?.email
      )

      console.log(
        'AUTHENTICATED ROLE:',
        role
      )


      // ========================================================
      // SAVE CURRENT USER ONLY
      // ========================================================

      localStorage.setItem(
        'userProfile',
        JSON.stringify(
          profile
        )
      )


      localStorage.setItem(
        'userRole',
        role
      )


      // ========================================================
      // OPTIONAL REMEMBER ME
      // ========================================================
      //
      // We deliberately DO NOT save the password.
      //
      // ========================================================

      if (rememberMe) {

        localStorage.setItem(
          'rememberedEmail',
          cleanEmail
        )

      }

      else {

        localStorage.removeItem(
          'rememberedEmail'
        )

      }


      // ========================================================
      // SUCCESS
      // ========================================================

      await Swal.fire({

        title:
          'Welcome back',

        text:
          'Login successful!',

        icon:
          'success',

        timer:
          1000,

        showConfirmButton:
          false,

        background:
          'var(--bg-elevated)',

        color:
          'var(--text)',

      })


      // ========================================================
      // REDIRECT
      // ========================================================

      redirectByRole(
        role
      )


    }

    catch (
      error
    ) {

      console.error(
        'LOGIN ERROR:',
        error
      )


      // ========================================================
      // CLEAR INVALID SESSION
      // ========================================================

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


      // ========================================================
      // ERROR MESSAGE
      // ========================================================

      let message =
        'Incorrect email or password.'


      if (
        error.response?.status ===
        401
      ) {

        message =
          'Incorrect email or password.'

      }

      else if (
        error.response?.data?.detail
      ) {

        message =
          error.response.data.detail

      }

      else if (
        error.response?.data?.message
      ) {

        message =
          error.response.data.message

      }

      else if (
        error.response?.data?.email
      ) {

        message =
          error.response.data.email[0]

      }

      else if (
        error.response?.data?.password
      ) {

        message =
          error.response.data.password[0]

      }

      else if (
        error.message
      ) {

        message =
          error.message

      }


      setErrors({

        email:
          message

      })


      // ========================================================
      // ERROR ALERT
      // ========================================================

      Swal.fire({

        title:
          'Login Failed',

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


    }

    finally {

      setLoading(
        false
      )

    }

  }


  // ============================================================
  // RETURN UI
  // ============================================================

  return (

    <div
      className="swu-app-bg d-flex align-items-center"
      style={{
        minHeight:
          '100vh',
      }}
    >

      <ParticleBackground
        count={14}
      />


      <div
        className="container position-relative"
      >

        <div
          className="row align-items-center justify-content-center g-5"
        >


          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div
            className="col-lg-5 d-none d-lg-block"
          >

            <div
              className="text-center"
            >

              <SafetyShield
                height={300}
              />


              <h4
                className="font-display fw-bold mt-3"
              >

                Guarded, always.

              </h4>


              <p
                className="text-muted-swu"
              >

                Your account is protected by SafeWithUs safety infrastructure.

              </p>

            </div>

          </div>


          {/* ==================================================
              LOGIN CARD
          ================================================== */}

          <div
            className="col-lg-5 col-md-8"
          >

            <div
              className="glass-strong p-4 p-md-5 reveal in-view"
            >


              {/* ==================================================
                  LOGO
              ================================================== */}

              <Link
                to="/"
                className="d-flex align-items-center gap-2 mb-4 text-decoration-none"
              >

                <span
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width:
                      34,

                    height:
                      34,

                    borderRadius:
                      9,

                    background:
                      'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  }}
                >

                  <FiShield
                    color="#08111a"
                    size={16}
                  />

                </span>


                <span
                  className="font-display fw-bold"
                  style={{
                    color:
                      'var(--text)',
                  }}
                >

                  SafeWithUs

                </span>

              </Link>


              {/* ==================================================
                  HEADER
              ================================================== */}

              <h3
                className="font-display fw-bold mb-1"
              >

                Welcome back

              </h3>


              <p
                className="text-muted-swu mb-4"
              >

                Login to access your SafeWithUs account.

              </p>


              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={
                  handleSubmit
                }

                noValidate

                autoComplete="off"
              >


                {/* ==================================================
                    EMAIL
                ================================================== */}

                <div
                  className="mb-3"
                >

                  <label
                    className="form-label text-muted-swu"
                    style={{
                      fontSize:
                        '0.85rem',
                    }}
                  >

                    Email

                  </label>


                  <div
                    className="position-relative"
                  >

                    <input
                      name="login-email"

                      id="login-email"

                      type="email"

                      className="form-control form-control-swu"

                      placeholder="you@example.com"

                      value={
                        email
                      }

                      onChange={
                        (e) =>
                          setEmail(
                            e.target.value
                          )
                      }

                      autoComplete="off"

                      spellCheck="false"

                      autoCapitalize="none"

                      disabled={
                        loading
                      }
                    />

                  </div>


                  {errors.email && (

                    <div
                      className="text-danger-swu mt-1"
                      style={{
                        fontSize:
                          '0.8rem',
                      }}
                    >

                      {errors.email}

                    </div>

                  )}

                </div>


                {/* ==================================================
                    PASSWORD
                ================================================== */}

                <div
                  className="mb-3"
                >

                  <label
                    className="form-label text-muted-swu"
                    style={{
                      fontSize:
                        '0.85rem',
                    }}
                  >

                    Password

                  </label>


                  <div
                    className="position-relative"
                  >

                    <input
                      name="login-password"

                      id="login-password"

                      type="password"

                      className="form-control form-control-swu"

                      placeholder="••••••••"

                      value={
                        password
                      }

                      onChange={
                        (e) =>
                          setPassword(
                            e.target.value
                          )
                      }

                      autoComplete="new-password"

                      disabled={
                        loading
                      }
                    />

                  </div>


                  {errors.password && (

                    <div
                      className="text-danger-swu mt-1"
                      style={{
                        fontSize:
                          '0.8rem',
                      }}
                    >

                      {errors.password}

                    </div>

                  )}

                </div>


                {/* ==================================================
                    OPTIONS
                ================================================== */}

                <div
                  className="d-flex justify-content-between align-items-center mb-4"
                >

                  <div
                    className="form-check"
                  >

                    <input
                      className="form-check-input"

                      type="checkbox"

                      id="remember"

                      checked={
                        rememberMe
                      }

                      onChange={
                        (e) =>
                          setRememberMe(
                            e.target.checked
                          )
                      }
                    />


                    <label
                      className="form-check-label text-muted-swu"
                      htmlFor="remember"
                      style={{
                        fontSize:
                          '0.85rem',
                      }}
                    >

                      Remember me

                    </label>

                  </div>


                  <Link
                    to="/forgot-password"
                    className="swu-nav-link px-0"
                    style={{
                      fontSize:
                        '0.85rem',
                    }}
                  >

                    Forgot password?

                  </Link>

                </div>


                {/* ==================================================
                    LOGIN BUTTON
                ================================================== */}

                <button
                  type="submit"

                  className="btn btn-swu-primary w-100 d-flex align-items-center justify-content-center gap-2 mb-3"

                  disabled={
                    loading
                  }
                >

                  {loading ? (

                    <>

                      <span
                        className="spinner-border spinner-border-sm"
                      />

                      Logging in...

                    </>

                  ) : (

                    <>

                      Login

                      <FiArrowRight />

                    </>

                  )}

                </button>


                {/* ==================================================
                    GOOGLE
                ================================================== */}

                <button
                  type="button"

                  className="btn btn-swu-ghost w-100 d-flex align-items-center justify-content-center gap-2"

                  disabled

                  title="Google login will be connected later"
                >

                  <FcGoogle
                    size={18}
                  />

                  Continue with Google

                </button>

              </form>


              {/* ==================================================
                  REGISTER
              ================================================== */}

              <div
                className="text-center text-muted-swu mt-4"
                style={{
                  fontSize:
                    '0.88rem',
                }}
              >

                Don't have an account?{' '}

                <Link
                  to="/register"
                  className="text-accent"
                >

                  Create one

                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}