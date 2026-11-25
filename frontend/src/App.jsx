import React from 'react'
import { Routes, Route } from 'react-router-dom'

// ============================================================
// PUBLIC PAGES
// ============================================================

import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'

// ============================================================
// USER MODULE
// ============================================================

import UserDashboard from './pages/user/UserDashboard.jsx'
import UserEmergency from './pages/user/UserEmergency.jsx'
import UserLiveLocation from './pages/user/UserLiveLocation.jsx'
import UserSafetyZones from './pages/user/UserSafetyZones.jsx'
import UserTrustedContacts from './pages/user/UserTrustedContacts.jsx'
import UserProfile from './pages/user/UserProfile.jsx'
import UserSettings from './pages/user/UserSettings.jsx'

// ============================================================
// GUARDIAN MODULE
// ============================================================

import GuardianDashboard from './pages/guardian/GuardianDashboard.jsx'
import GuardianAlerts from './pages/guardian/GuardianAlerts.jsx'
import GuardianEmergency from './pages/guardian/GuardianEmergency.jsx'
import GuardianLiveLocation from './pages/guardian/GuardianLiveLocation.jsx'
import GuardianTrustedContacts from './pages/guardian/GuardianTrustedContacts.jsx'
import GuardianProfile from './pages/guardian/GuardianProfile.jsx'
import GuardianSettings from './pages/guardian/GuardianSettings.jsx'

// ============================================================
// ADMIN MODULE
// ============================================================

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminAlerts from './pages/admin/AdminAlerts.jsx'
import AdminEmergency from './pages/admin/AdminEmergency.jsx'
import AdminLiveLocation from './pages/admin/AdminLiveLocation.jsx'
import AdminTrustedContacts from './pages/admin/AdminTrustedContacts.jsx'
import AdminProfile from './pages/admin/AdminProfile.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'

// ============================================================
// PROTECTED ROUTE
// ============================================================

import ProtectedRoute from './components/ProtectedRoute.jsx'


export default function App() {
  return (
    <Routes>

      {/* PUBLIC */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* PROTECTED */}

      <Route element={<ProtectedRoute />}>

        {/* USER */}

        <Route
          path="/dashboard"
          element={<UserDashboard />}
        />

        <Route
          path="/emergency"
          element={<UserEmergency />}
        />

        <Route
          path="/location"
          element={<UserLiveLocation />}
        />

        <Route
          path="/safety-zones"
          element={<UserSafetyZones />}
        />

        <Route
          path="/contacts"
          element={<UserTrustedContacts />}
        />

        <Route
          path="/profile"
          element={<UserProfile />}
        />

        <Route
          path="/settings"
          element={<UserSettings />}
        />


        {/* GUARDIAN */}

        <Route
          path="/guardian/dashboard"
          element={<GuardianDashboard />}
        />

        <Route
          path="/guardian/alerts"
          element={<GuardianAlerts />}
        />

        <Route
          path="/guardian/emergency"
          element={<GuardianEmergency />}
        />

        <Route
          path="/guardian/location"
          element={<GuardianLiveLocation />}
        />

        <Route
          path="/guardian/contacts"
          element={<GuardianTrustedContacts />}
        />

        <Route
          path="/guardian/profile"
          element={<GuardianProfile />}
        />

        <Route
          path="/guardian/settings"
          element={<GuardianSettings />}
        />


        {/* ADMIN */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/alerts"
          element={<AdminAlerts />}
        />

        <Route
          path="/admin/emergency"
          element={<AdminEmergency />}
        />

        <Route
          path="/admin/location"
          element={<AdminLiveLocation />}
        />

        <Route
          path="/admin/trusted-contacts"
          element={<AdminTrustedContacts />}
        />

        <Route
          path="/admin/profile"
          element={<AdminProfile />}
        />

        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

      </Route>

    </Routes>
  )
}