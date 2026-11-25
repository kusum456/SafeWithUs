import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiMail, FiCheckCircle, FiLock, FiArrowRight } from 'react-icons/fi'
import ParticleBackground from '../components/ParticleBackground.jsx'

const steps = ['Enter Email', 'Verify', 'Reset Password', 'Complete']

export default function ForgotPassword() {
  const [step, setStep] = useState(0)

  const next = (e) => {
    e.preventDefault()
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  return (
    <div className="swu-app-bg d-flex align-items-center" style={{ minHeight: '100vh' }}>
      <ParticleBackground count={14} />
      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="glass-strong p-4 p-md-5">
              <Link to="/" className="d-flex align-items-center gap-2 mb-4 text-decoration-none justify-content-center">
                <span className="d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
                  <FiShield color="#08111a" size={16} />
                </span>
                <span className="font-display fw-bold" style={{ color: 'var(--text)' }}>SafeWithUs</span>
              </Link>

              <div className="d-flex align-items-center justify-content-between mb-5 position-relative">
                <div className="position-absolute divider-glow" style={{ top: 15, left: 24, right: 24, zIndex: 0 }} />
                {steps.map((s, i) => (
                  <div key={s} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 1, flex: 1 }}>
                    <div
                      className="d-flex align-items-center justify-content-center font-mono mb-2"
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: i <= step ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'var(--surface-strong)',
                        color: i <= step ? '#08111a' : 'var(--text-faint)',
                        border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.8rem',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {i < step ? <FiCheckCircle size={14} /> : i + 1}
                    </div>
                    <span className="text-muted-swu text-center d-none d-sm-block" style={{ fontSize: '0.7rem' }}>{s}</span>
                  </div>
                ))}
              </div>

              {step === 0 && (
                <form onSubmit={next}>
                  <h4 className="font-display fw-bold mb-1 text-center">Reset your password</h4>
                  <p className="text-muted-swu text-center mb-4">Enter the email linked to your account.</p>
                  <div className="position-relative mb-4">
                    <FiMail className="position-absolute text-faint-swu" style={{ top: 14, left: 14 }} />
                    <input required type="email" className="form-control form-control-swu ps-5" placeholder="you@example.com" />
                  </div>
                  <button type="submit" className="btn btn-swu-primary w-100 d-flex align-items-center justify-content-center gap-2">
                    Send Verification Code <FiArrowRight />
                  </button>
                </form>
              )}

              {step === 1 && (
                <form onSubmit={next}>
                  <h4 className="font-display fw-bold mb-1 text-center">Verify it&rsquo;s you</h4>
                  <p className="text-muted-swu text-center mb-4">Enter the 6-digit code sent to your email.</p>
                  <div className="d-flex gap-2 justify-content-center mb-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input key={i} maxLength={1} className="form-control form-control-swu text-center font-mono" style={{ width: 44 }} />
                    ))}
                  </div>
                  <button type="submit" className="btn btn-swu-primary w-100 d-flex align-items-center justify-content-center gap-2">
                    Verify Code <FiArrowRight />
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={next}>
                  <h4 className="font-display fw-bold mb-1 text-center">Set a new password</h4>
                  <p className="text-muted-swu text-center mb-4">Choose a strong password you haven&rsquo;t used before.</p>
                  <div className="position-relative mb-3">
                    <FiLock className="position-absolute text-faint-swu" style={{ top: 14, left: 14 }} />
                    <input required type="password" className="form-control form-control-swu ps-5" placeholder="New password" />
                  </div>
                  <div className="position-relative mb-4">
                    <FiLock className="position-absolute text-faint-swu" style={{ top: 14, left: 14 }} />
                    <input required type="password" className="form-control form-control-swu ps-5" placeholder="Confirm new password" />
                  </div>
                  <button type="submit" className="btn btn-swu-primary w-100 d-flex align-items-center justify-content-center gap-2">
                    Reset Password <FiArrowRight />
                  </button>
                </form>
              )}

              {step === 3 && (
                <div className="text-center py-3">
                  <FiCheckCircle size={44} className="text-accent mb-3" />
                  <h4 className="font-display fw-bold mb-1">Password reset</h4>
                  <p className="text-muted-swu mb-4">Your password has been updated successfully.</p>
                  <Link to="/login" className="btn btn-swu-primary d-inline-flex align-items-center gap-2">
                    Back to Login <FiArrowRight />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
