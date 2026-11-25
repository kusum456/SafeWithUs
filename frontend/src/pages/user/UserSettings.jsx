import React, { useState } from 'react'
import {
  FiUser,
  FiShield,
  FiBell,
  FiEye,
  FiSun,
} from 'react-icons/fi'

import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'


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
          transition: 'left 0.3s cubic-bezier(.2,.9,.3,1.2)',
        }}
      />
    </div>
  )
}


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
        borderBottom: '1px solid var(--border-soft)',
      }}
    >
      <div>
        <div style={{ fontSize: '0.92rem' }}>
          {label}
        </div>

        {desc && (
          <div
            className="text-muted-swu"
            style={{ fontSize: '0.78rem' }}
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


const initialToggles = {
  sosSettings: true,
  locationSharing: true,
  emergencyContacts: true,
  safetyZonesAlerts: false,

  emergencyAlerts: true,
  locationAlerts: true,
  systemNotifications: false,

  locationPrivacy: true,
  dataPreferences: false,
}


export default function UserSettings() {

  const [toggles, setToggles] = useState(
    initialToggles
  )

  const {
    theme,
    toggleTheme,
  } = useTheme()


  const flip = (key) => {
    setToggles((t) => ({
      ...t,
      [key]: !t[key],
    }))
  }


  return (
    <DashboardLayout
      title="Settings"
      subtitle="Fine-tune how SafeWithUs protects you."
    >

      <div className="row g-4">

        {/* =========================
            ACCOUNT + SAFETY
        ========================= */}

        <div className="col-lg-6">

          {/* Account */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-1 d-flex align-items-center gap-2">
              <FiUser className="text-accent" />
              Account
            </h6>

            <div
              className="text-muted-swu mb-2"
              style={{ fontSize: '0.82rem' }}
            >
              Manage your profile and credentials.
            </div>

            <button
              className="btn btn-swu-ghost w-100 mb-2 text-start"
              type="button"
            >
              Edit Profile
            </button>

            <button
              className="btn btn-swu-ghost w-100 text-start"
              type="button"
            >
              Change Password
            </button>

          </div>


          {/* Safety */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">
              <FiShield className="text-accent" />
              Safety
            </h6>

            <Row
              label="SOS Settings"
              desc="Configure how the emergency button behaves"
              checked={toggles.sosSettings}
              onChange={() =>
                flip('sosSettings')
              }
            />

            <Row
              label="Location Sharing"
              desc="Share live location with trusted contacts"
              checked={toggles.locationSharing}
              onChange={() =>
                flip('locationSharing')
              }
            />

            <Row
              label="Emergency Contacts"
              desc="Notify contacts automatically during SOS"
              checked={toggles.emergencyContacts}
              onChange={() =>
                flip('emergencyContacts')
              }
            />

            <div className="pt-3">

              <Row
                label="Safety Zone Alerts"
                desc="Notify when entering or leaving zones"
                checked={toggles.safetyZonesAlerts}
                onChange={() =>
                  flip('safetyZonesAlerts')
                }
              />

            </div>

          </div>

        </div>


        {/* =========================
            NOTIFICATIONS + PRIVACY
        ========================= */}

        <div className="col-lg-6">

          {/* Notifications */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">
              <FiBell className="text-accent" />
              Notifications
            </h6>

            <Row
              label="Emergency Alerts"
              checked={toggles.emergencyAlerts}
              onChange={() =>
                flip('emergencyAlerts')
              }
            />

            <Row
              label="Location Alerts"
              checked={toggles.locationAlerts}
              onChange={() =>
                flip('locationAlerts')
              }
            />

            <Row
              label="System Notifications"
              checked={toggles.systemNotifications}
              onChange={() =>
                flip('systemNotifications')
              }
            />

          </div>


          {/* Appearance */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">
              <FiSun className="text-accent" />
              Appearance
            </h6>

            <div className="d-flex align-items-center justify-content-between py-2">

              <div style={{ fontSize: '0.92rem' }}>
                Dark Mode
              </div>

              <Toggle
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />

            </div>

          </div>


          {/* Privacy */}

          <div className="glass glass-card">

            <h6 className="mb-2 d-flex align-items-center gap-2">
              <FiEye className="text-accent" />
              Privacy
            </h6>

            <Row
              label="Location Privacy"
              desc="Limit who can see your live location"
              checked={toggles.locationPrivacy}
              onChange={() =>
                flip('locationPrivacy')
              }
            />

            <Row
              label="Data Preferences"
              desc="Control how your data is stored"
              checked={toggles.dataPreferences}
              onChange={() =>
                flip('dataPreferences')
              }
            />

          </div>

        </div>

      </div>

    </DashboardLayout>
  )
}