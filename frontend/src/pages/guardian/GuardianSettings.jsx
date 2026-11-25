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


// =====================================================
// TOGGLE COMPONENT
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


// =====================================================
// GUARDIAN SETTINGS
// =====================================================

const initialToggles = {

  // Guardian safety
  emergencyAlerts: true,
  sosAlerts: true,
  locationAlerts: true,
  safeZoneAlerts: true,

  // Guardian notifications
  systemNotifications: true,
  guardianNotifications: true,

  // Privacy
  locationPrivacy: true,
  activityPrivacy: true,

}


export default function GuardianSettings() {

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
      title="Guardian Settings"
      subtitle="Manage your guardian preferences and safety notifications."
    >

      <div className="row g-4">

        {/* =================================================
            GUARDIAN ACCOUNT
        ================================================= */}

        <div className="col-lg-6">

          <div className="glass glass-card mb-4">

            <h6 className="mb-1 d-flex align-items-center gap-2">

              <FiUser className="text-accent" />

              Guardian Account

            </h6>

            <div
              className="text-muted-swu mb-3"
              style={{ fontSize: '0.82rem' }}
            >
              Manage your guardian profile and account.
            </div>


            <button
              type="button"
              className="btn btn-swu-ghost w-100 mb-2 text-start"
            >
              Edit Profile
            </button>


            <button
              type="button"
              className="btn btn-swu-ghost w-100 text-start"
            >
              Change Password
            </button>

          </div>


          {/* =================================================
              PROTECTED USER SAFETY
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiShield className="text-accent" />

              Protected User Safety

            </h6>


            <Row
              label="Emergency Alerts"
              desc="Receive alerts when a protected user triggers SOS"
              checked={toggles.emergencyAlerts}
              onChange={() =>
                flip('emergencyAlerts')
              }
            />


            <Row
              label="SOS Alerts"
              desc="Immediately notify me when an SOS is triggered"
              checked={toggles.sosAlerts}
              onChange={() =>
                flip('sosAlerts')
              }
            />


            <Row
              label="Location Alerts"
              desc="Receive important location updates"
              checked={toggles.locationAlerts}
              onChange={() =>
                flip('locationAlerts')
              }
            />


            <Row
              label="Safe Zone Alerts"
              desc="Notify me when a protected user leaves a safe zone"
              checked={toggles.safeZoneAlerts}
              onChange={() =>
                flip('safeZoneAlerts')
              }
            />

          </div>

        </div>


        {/* =================================================
            NOTIFICATIONS + PRIVACY
        ================================================= */}

        <div className="col-lg-6">


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="glass glass-card mb-4">

            <h6 className="mb-2 d-flex align-items-center gap-2">

              <FiBell className="text-accent" />

              Notifications

            </h6>


            <Row
              label="Guardian Notifications"
              desc="Receive important updates about protected users"
              checked={
                toggles.guardianNotifications
              }
              onChange={() =>
                flip('guardianNotifications')
              }
            />


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

              <div style={{ fontSize: '0.92rem' }}>
                Dark Mode
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

              Privacy

            </h6>


            <Row
              label="Location Privacy"
              desc="Control visibility of protected user locations"
              checked={
                toggles.locationPrivacy
              }
              onChange={() =>
                flip('locationPrivacy')
              }
            />


            <Row
              label="Activity Privacy"
              desc="Control visibility of protected user activity"
              checked={
                toggles.activityPrivacy
              }
              onChange={() =>
                flip('activityPrivacy')
              }
            />

          </div>

        </div>

      </div>

    </DashboardLayout>

  )
}