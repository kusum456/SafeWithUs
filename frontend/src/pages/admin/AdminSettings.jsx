import React, { useState } from 'react'
import {
  FiUser,
  FiShield,
  FiBell,
  FiEye,
  FiSun,
  FiDatabase,
  FiUsers,
  FiAlertTriangle,
} from 'react-icons/fi'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'


// =====================================================
// TOGGLE
// =====================================================

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onChange()
        }
      }}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        cursor: 'pointer',
        background: checked
          ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
          : 'var(--surface-strong)',
        border: '1px solid var(--border)',
        position: 'relative',
        transition: 'background 0.3s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: checked
            ? '#08111a'
            : 'var(--text-faint)',
          transition:
            'left 0.3s cubic-bezier(.2,.9,.3,1.2)',
        }}
      />
    </div>
  )
}


// =====================================================
// SETTING ROW
// =====================================================

function Row({
  label,
  desc,
  checked,
  onChange,
}) {
  return (
    <div
      className="d-flex align-items-center justify-content-between py-3"
      style={{
        borderBottom:
          '1px solid var(--border-soft)',
      }}
    >
      <div>
        <div style={{ fontSize: '0.92rem' }}>
          {label}
        </div>

        {desc && (
          <div
            className="text-muted-swu"
            style={{
              fontSize: '0.78rem',
            }}
          >
            {desc}
          </div>
        )}
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
      />
    </div>
  )
}


// =====================================================
// INITIAL ADMIN SETTINGS
// =====================================================

const initialToggles = {

  // System
  systemNotifications: true,
  maintenanceMode: false,

  // User monitoring
  userRegistration: true,
  guardianRegistration: true,
  locationMonitoring: true,

  // Emergency
  emergencyAlerts: true,
  emergencyNotifications: true,
  geofenceAlerts: true,

  // Security
  loginAlerts: true,
  securityNotifications: true,
  auditLogging: true,

  // Privacy
  locationPrivacy: true,
  dataProtection: true,
}


// =====================================================
// ADMIN SETTINGS
// =====================================================

export default function AdminSettings() {

  const [toggles, setToggles] =
    useState(initialToggles)

  const {
    theme,
    toggleTheme,
  } = useTheme()


  const flip = (key) => {
    setToggles((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }


  return (
    <DashboardLayout
      title="Admin Settings"
      subtitle="Manage SafeWithUs system configuration and security preferences."
    >

      <div className="row g-4">


        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div className="col-lg-6">


          {/* =================================================
              ADMIN ACCOUNT
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-1 d-flex align-items-center gap-2">

              <FiUser className="text-accent" />

              Admin Account

            </h6>

            <div
              className="text-muted-swu mb-3"
              style={{
                fontSize: '0.82rem',
              }}
            >
              Manage administrator profile and credentials.
            </div>


            <button
              type="button"
              className="btn btn-swu-ghost w-100 mb-2 text-start"
            >
              Edit Admin Profile
            </button>


            <button
              type="button"
              className="btn btn-swu-ghost w-100 text-start"
            >
              Change Password
            </button>

          </div>


          {/* =================================================
              USER MANAGEMENT
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiUsers className="text-accent" />

              User Management

            </h6>


            <Row
              label="User Registration"
              desc="Allow new users to create SafeWithUs accounts"
              checked={
                toggles.userRegistration
              }
              onChange={() =>
                flip('userRegistration')
              }
            />


            <Row
              label="Guardian Registration"
              desc="Allow guardian accounts to be created"
              checked={
                toggles.guardianRegistration
              }
              onChange={() =>
                flip('guardianRegistration')
              }
            />


            <Row
              label="Location Monitoring"
              desc="Enable live location monitoring for users"
              checked={
                toggles.locationMonitoring
              }
              onChange={() =>
                flip('locationMonitoring')
              }
            />

          </div>


          {/* =================================================
              DATABASE
          ================================================= */}

          <div className="glass glass-card">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiDatabase className="text-accent" />

              System Data

            </h6>


            <div
              className="text-muted-swu mb-3"
              style={{
                fontSize: '0.82rem',
              }}
            >
              Manage system data and administrative records.
            </div>


            <button
              type="button"
              className="btn btn-swu-ghost w-100 mb-2 text-start"
            >
              View System Logs
            </button>


            <button
              type="button"
              className="btn btn-swu-ghost w-100 text-start"
            >
              Export System Data
            </button>

          </div>

        </div>


        {/* =================================================
            RIGHT COLUMN
        ================================================= */}

        <div className="col-lg-6">


          {/* =================================================
              EMERGENCY & SAFETY
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiAlertTriangle className="text-accent" />

              Emergency & Safety

            </h6>


            <Row
              label="Emergency Alerts"
              desc="Enable emergency alerts across the platform"
              checked={
                toggles.emergencyAlerts
              }
              onChange={() =>
                flip('emergencyAlerts')
              }
            />


            <Row
              label="Emergency Notifications"
              desc="Send emergency notifications to guardians"
              checked={
                toggles.emergencyNotifications
              }
              onChange={() =>
                flip('emergencyNotifications')
              }
            />


            <Row
              label="Geofence Alerts"
              desc="Enable safe-zone entry and exit alerts"
              checked={
                toggles.geofenceAlerts
              }
              onChange={() =>
                flip('geofenceAlerts')
              }
            />

          </div>


          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiShield className="text-accent" />

              Security

            </h6>


            <Row
              label="Login Alerts"
              desc="Notify administrators about important login activity"
              checked={
                toggles.loginAlerts
              }
              onChange={() =>
                flip('loginAlerts')
              }
            />


            <Row
              label="Security Notifications"
              desc="Receive important security notifications"
              checked={
                toggles.securityNotifications
              }
              onChange={() =>
                flip('securityNotifications')
              }
            />


            <Row
              label="Audit Logging"
              desc="Keep records of important administrative actions"
              checked={
                toggles.auditLogging
              }
              onChange={() =>
                flip('auditLogging')
              }
            />

          </div>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiBell className="text-accent" />

              System Notifications

            </h6>


            <Row
              label="System Notifications"
              desc="Receive SafeWithUs system updates"
              checked={
                toggles.systemNotifications
              }
              onChange={() =>
                flip('systemNotifications')
              }
            />

          </div>


          {/* =================================================
              APPEARANCE
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiSun className="text-accent" />

              Appearance

            </h6>


            <div
              className="d-flex align-items-center justify-content-between py-2"
            >

              <div>

                <div
                  style={{
                    fontSize: '0.92rem',
                  }}
                >
                  Dark Mode
                </div>

                <div
                  className="text-muted-swu"
                  style={{
                    fontSize: '0.78rem',
                  }}
                >
                  Change the administrator dashboard theme.
                </div>

              </div>


              <Toggle
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />

            </div>

          </div>


          {/* =================================================
              PRIVACY
          ================================================= */}

          <div className="glass glass-card">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiEye className="text-accent" />

              Privacy & Data Protection

            </h6>


            <Row
              label="Location Privacy"
              desc="Apply location privacy controls to protected users"
              checked={
                toggles.locationPrivacy
              }
              onChange={() =>
                flip('locationPrivacy')
              }
            />


            <Row
              label="Data Protection"
              desc="Apply additional protection to stored user data"
              checked={
                toggles.dataProtection
              }
              onChange={() =>
                flip('dataProtection')
              }
            />

          </div>

        </div>

      </div>

    </DashboardLayout>
  )
}