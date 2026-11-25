import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { registerUser } from '../services/authService'
import { FiUser, FiMail, FiPhone, FiAtSign, FiLock, FiShield, FiArrowRight } from 'react-icons/fi'
import SafetyShield from '../components/SafetyShield.jsx'
import ParticleBackground from '../components/ParticleBackground.jsx'

function scorePassword(pwd) {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score
}
const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
const colors = ['#ff4d5e', '#ff4d5e', '#ffb547', '#26e0c9', '#26e0c9']

export default function Register() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const strength = useMemo(() => scorePassword(password), [password])

  const handleSubmit = async (e) => {
  e.preventDefault()

  const form = new FormData(e.target)

  const passwordValue = form.get('password')
  const confirmPasswordValue = form.get('confirmPassword')

  // Check password confirmation
  if (passwordValue !== confirmPasswordValue) {
    setError('Passwords do not match')
    return
  }

  // Check terms
  if (!agree) {
    setError('Please accept the Terms & Conditions')
    return
  }

  setError('')

  const userData = {
    username: form.get('username'),
    email: form.get('email'),
    phone: form.get('phone'),
    password: passwordValue,
    role: 'user',
  }

  try {
    await registerUser(userData)

    await Swal.fire({
      title: 'Account created',
      text: 'Welcome to SafeWithUs!',
      icon: 'success',
      confirmButtonColor: '#26e0c9',
      background: 'var(--bg-elevated)',
      color: 'var(--text)',
    })

    navigate('/login')

  } catch (error) {
    console.error('Registration error:', error)

    const responseData = error.response?.data

    if (responseData?.username) {
      setError(responseData.username[0])
    } else if (responseData?.email) {
      setError(responseData.email[0])
    } else if (responseData?.phone) {
      setError(responseData.phone[0])
    } else if (responseData?.password) {
      setError(responseData.password[0])
    } else if (responseData?.detail) {
      setError(responseData.detail)
    } else {
      setError('Registration failed. Please try again.')
    }
  }
}
  return (
    <div className="swu-app-bg d-flex align-items-center py-5" style={{ minHeight: '100vh' }}>
      <ParticleBackground count={14} />
      <div className="container position-relative">
        <div className="row align-items-center justify-content-center g-5">
          <div className="col-lg-5 d-none d-lg-block">
            <div className="text-center">
              <SafetyShield height={340} />
              <h4 className="font-display fw-bold mt-3">Join your circle.</h4>
              <p className="text-muted-swu">It takes under a minute to set up your safety profile.</p>
            </div>
          </div>

          <div className="col-lg-6 col-md-9">
            <div className="glass-strong p-4 p-md-5">
              <Link to="/" className="d-flex align-items-center gap-2 mb-4 text-decoration-none">
                <span className="d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
                  <FiShield color="#08111a" size={16} />
                </span>
                <span className="font-display fw-bold" style={{ color: 'var(--text)' }}>SafeWithUs</span>
              </Link>
              <h3 className="font-display fw-bold mb-1">Create your account</h3>
              <p className="text-muted-swu mb-4">Set up your safety profile in a few steps.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-14">
                    <label className="form-label text-muted-swu" style={{ fontSize: '0.85rem' }}>Username</label>
                    <div className="position-relative">
                      <input required name="username" className="form-control form-control-swu ps-5" placeholder="username" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted-swu" style={{ fontSize: '0.85rem' }}>Email</label>
                    <div className="position-relative">
                      <input required type="email" name="email" className="form-control form-control-swu ps-5" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted-swu" style={{ fontSize: '0.85rem' }}>Phone Number</label>
                    <div className="position-relative">
                      <input required name="phone" className="form-control form-control-swu ps-5" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted-swu" style={{ fontSize: '0.85rem' }}>Password</label>
                    <div className="position-relative">
                      <input required name="password" type="password" className="form-control form-control-swu ps-5" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div className="d-flex gap-1 mt-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} style={{ height: 4, flex: 1, borderRadius: 4, background: i < strength ? colors[strength] : 'var(--border)', transition: 'background 0.3s ease' }} />
                      ))}
                    </div>
                    {password && <div style={{ fontSize: '0.75rem', color: colors[strength] }} className="mt-1">{labels[strength]}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted-swu" style={{ fontSize: '0.85rem' }}>Confirm Password</label>
                    <div className="position-relative">
                      <input required name="confirmPassword" type="password" className="form-control form-control-swu ps-5" placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <div className="form-check mt-4">
                  <input className="form-check-input" type="checkbox" id="terms" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <label className="form-check-label text-muted-swu" htmlFor="terms" style={{ fontSize: '0.85rem' }}>
                    I agree to the <span className="text-accent">Terms &amp; Conditions</span>
                  </label>
                </div>
                {error && <div className="text-danger-swu mt-2" style={{ fontSize: '0.82rem' }}>{error}</div>}

                <button type="submit" className="btn btn-swu-primary w-100 d-flex align-items-center justify-content-center gap-2 mt-4">
                  Create Account <FiArrowRight />
                </button>
              </form>

              <div className="text-center text-muted-swu mt-4" style={{ fontSize: '0.88rem' }}>
                Already have an account? <Link to="/login" className="text-accent">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
