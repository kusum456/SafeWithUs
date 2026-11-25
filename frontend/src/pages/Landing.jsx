import React from 'react'
import { useNavigate } from 'react-router-dom'

import {
  FiAlertTriangle,
  FiMapPin,
  FiUsers,
  FiBell,
  FiShield,
  FiPhoneCall,
  FiArrowRight,
  FiNavigation,
  FiUser,
  FiActivity,
  FiSettings,
} from 'react-icons/fi'

import MainLayout from '../layouts/MainLayout.jsx'
import HolographicEarth from '../components/HolographicEarth.jsx'
import ParticleBackground from '../components/ParticleBackground.jsx'
import StatCard from '../components/StatCard.jsx'
import { useReveal } from '../hooks/useCountUp.js'


// ============================================================
// FEATURES
// ============================================================

const features = [
  {
    icon: FiAlertTriangle,
    title: 'Emergency SOS',
    desc: 'Trigger an emergency alert quickly and notify your trusted safety network.',
  },
  {
    icon: FiMapPin,
    title: 'Live Location',
    desc: 'Share your current location with authorized trusted contacts when you need help.',
  },
  {
    icon: FiUsers,
    title: 'Trusted Contacts',
    desc: 'Create your personal safety circle with guardians, family, friends, and trusted people.',
  },
  {
    icon: FiBell,
    title: 'Safety Alerts',
    desc: 'Receive important notifications when safety events occur.',
  },
  {
    icon: FiShield,
    title: 'Safety Zones',
    desc: 'Create safe zones around places such as home, college, office, or other trusted locations.',
  },
  {
    icon: FiPhoneCall,
    title: 'Emergency Assistance',
    desc: 'Quick access to emergency services when immediate assistance is required.',
  },
]


// ============================================================
// HOW IT WORKS
// ============================================================

const howItWorks = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Register your SafeWithUs account and create your personal safety profile.',
  },
  {
    step: '02',
    title: 'Add Trusted Contacts',
    desc: 'Connect family members, friends, or guardians who can support you during emergencies.',
  },
  {
    step: '03',
    title: 'Set Your Safety Zones',
    desc: 'Choose trusted locations directly from the map and define your preferred safety radius.',
  },
  {
    step: '04',
    title: 'Stay Protected',
    desc: 'Use live location, SOS, geofencing, and your trusted safety network whenever needed.',
  },
]


// ============================================================
// ROLES
// ============================================================

const roles = [
  {
    icon: FiUser,
    title: 'User',
    subtitle: 'Your personal safety space',
    desc: 'Manage your profile, emergency SOS, live location, trusted contacts, and safety zones.',
  },
  {
    icon: FiActivity,
    title: 'Guardian',
    subtitle: 'Your trusted safety network',
    desc: 'Monitor linked users, view live location, emergency events, safety-zone status, and safety alerts.',
  },
  {
    icon: FiSettings,
    title: 'Admin',
    subtitle: 'System-wide monitoring',
    desc: 'Manage and monitor users, guardians, emergencies, locations, safety zones, alerts, and relationships.',
  },
]


// ============================================================
// STATS
// ============================================================

const stats = [
  {
    value: 24,
    suffix: '/7',
    label: 'Safety Monitoring',
  },
  {
    value: 3,
    suffix: '',
    label: 'Connected Roles',
  },
  {
    value: 1,
    suffix: '',
    label: 'Personal Safety Network',
  },
  {
    value: 100,
    suffix: '%',
    label: 'Focused on Safety',
  },
]


// ============================================================
// FLOATING CHIPS
// ============================================================

const floatingChips = [
  {
    label: 'Live Location',
    top: '6%',
    left: '-6%',
  },
  {
    label: 'Emergency Network',
    top: '32%',
    left: '82%',
  },
  {
    label: 'Safe Zone',
    top: '68%',
    left: '-8%',
  },
  {
    label: 'Trusted Contacts',
    top: '80%',
    left: '70%',
  },
  {
    label: 'SOS Status: Ready',
    top: '4%',
    left: '62%',
  },
]


// ============================================================
// LANDING
// ============================================================

export default function Landing() {

  const navigate =
    useNavigate()

  useReveal()


  return (

    <MainLayout>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        id="home"
        className="position-relative overflow-hidden"
        style={{
          paddingTop: 150,
          paddingBottom: 80,
        }}
      >

        <ParticleBackground
          count={18}
        />


        <div
          className="container position-relative"
        >

          <div
            className="row align-items-center gy-5"
          >

            {/* LEFT */}

            <div className="col-lg-6">

              <div
                className="eyebrow mb-3"
              >
                Personal Safety, Reimagined
              </div>


              <h1
                className="font-display fw-bold"
                style={{
                  fontSize:
                    'clamp(2.4rem, 5vw, 3.6rem)',
                  lineHeight:
                    1.08,
                }}
              >

                Your Safety.
                <br />
                Our Priority.

              </h1>


              <p
                className="text-muted-swu mt-3 mb-4"
                style={{
                  fontSize:
                    '1.05rem',
                  maxWidth:
                    480,
                }}
              >

                SafeWithUs connects users, trusted guardians,
                and administrators through emergency SOS,
                live location, trusted contacts, safety zones,
                and safety monitoring.

              </p>


              <div
                className="d-flex flex-wrap gap-3"
              >

                <button
                  className="btn btn-swu-primary d-flex align-items-center gap-2"
                  onClick={() =>
                    navigate(
                      '/register'
                    )
                  }
                  type="button"
                >

                  Get Started

                  <FiArrowRight />

                </button>


                <a
                  href="#features"
                  className="btn btn-swu-ghost d-flex align-items-center gap-2"
                >

                  Explore Features

                  <FiNavigation />

                </a>

              </div>


              {/* SMALL TRUST LINE */}

              <div
                className="d-flex align-items-center gap-2 mt-4"
                style={{
                  fontSize:
                    '0.76rem',
                }}
              >

                <span
                  className="status-dot on"
                />

                <span className="text-muted-swu">
                  Built around your trusted safety network
                </span>

              </div>

            </div>


            {/* RIGHT */}

            <div className="col-lg-6">

              <div
                className="position-relative"
                style={{
                  height: 480,
                }}
              >

                <HolographicEarth
                  height={480}
                />


                {floatingChips.map(
                  (chip, index) => (

                    <div
                      key={
                        chip.label
                      }
                      className="glass position-absolute d-none d-md-flex align-items-center gap-2 px-3 py-2 float-slow"
                      style={{
                        top:
                          chip.top,

                        left:
                          chip.left,

                        fontSize:
                          '0.78rem',

                        animationDelay:
                          `${index * 0.4}s`,
                      }}
                    >

                      <span
                        className="status-dot on"
                      />

                      {chip.label}

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="py-5"
      >

        <div
          className="container py-4"
        >

          <div
            className="text-center mb-5 reveal"
          >

            <div
              className="eyebrow mb-2"
            >
              What You Get
            </div>


            <h2
              className="font-display fw-bold"
            >
              Every tool you need to feel protected
            </h2>


            <p
              className="text-muted-swu mx-auto mt-3"
              style={{
                maxWidth:
                  650,
                fontSize:
                  '0.9rem',
              }}
            >

              A connected safety platform designed around
              people, trusted relationships, location awareness,
              and emergency response.

            </p>

          </div>


          <div
            className="row g-4"
          >

            {features.map(
              (feature, index) => {

                const Icon =
                  feature.icon


                return (

                  <div
                    key={
                      feature.title
                    }
                    className="col-md-6 col-lg-4 reveal"
                    style={{
                      transitionDelay:
                        `${index * 0.08}s`,
                    }}
                  >

                    <div
                      className="glass glass-card h-100"
                    >

                      <div
                        className="d-flex align-items-center justify-content-center mb-3"
                        style={{
                          width:
                            46,

                          height:
                            46,

                          borderRadius:
                            12,

                          background:
                            'var(--accent-soft)',
                        }}
                      >

                        <Icon
                          size={20}
                          className="text-accent"
                        />

                      </div>


                      <h5
                        className="fw-bold mb-2"
                      >
                        {feature.title}
                      </h5>


                      <p
                        className="text-muted-swu mb-0"
                        style={{
                          fontSize:
                            '0.9rem',
                        }}
                      >
                        {feature.desc}
                      </p>

                    </div>

                  </div>

                )

              }
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section
        id="how-it-works"
        className="py-5"
      >

        <div
          className="container py-4"
        >

          <div
            className="text-center mb-5 reveal"
          >

            <div
              className="eyebrow mb-2"
            >
              Getting Started
            </div>


            <h2
              className="font-display fw-bold"
            >
              How SafeWithUs Works
            </h2>

          </div>


          <div
            className="row g-4 position-relative"
          >

            <div
              className="d-none d-lg-block position-absolute divider-glow"
              style={{
                top: 34,
                left: '10%',
                right: '10%',
              }}
            />


            {howItWorks.map(
              (step, index) => (

                <div
                  key={
                    step.step
                  }
                  className="col-md-6 col-lg-3 reveal"
                  style={{
                    transitionDelay:
                      `${index * 0.08}s`,
                  }}
                >

                  <div
                    className="glass glass-card h-100 text-center"
                  >

                    <div
                      className="font-mono text-accent fw-bold mb-2"
                      style={{
                        fontSize:
                          '1.6rem',
                      }}
                    >
                      {step.step}
                    </div>


                    <h6
                      className="fw-bold"
                    >
                      {step.title}
                    </h6>


                    <p
                      className="text-muted-swu mb-0"
                      style={{
                        fontSize:
                          '0.85rem',
                      }}
                    >
                      {step.desc}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          THREE ROLES
      ====================================================== */}

      <section
        id="roles"
        className="py-5"
      >

        <div
          className="container py-4"
        >

          <div
            className="text-center mb-5 reveal"
          >

            <div
              className="eyebrow mb-2"
            >
              One Connected Network
            </div>


            <h2
              className="font-display fw-bold"
            >
              Built for Users, Guardians & Admins
            </h2>


            <p
              className="text-muted-swu mx-auto mt-3"
              style={{
                maxWidth:
                  650,
                fontSize:
                  '0.9rem',
              }}
            >

              Each role has a dedicated experience while remaining
              connected through the same safety network.

            </p>

          </div>


          <div
            className="row g-4"
          >

            {roles.map(
              (role, index) => {

                const Icon =
                  role.icon


                return (

                  <div
                    key={
                      role.title
                    }
                    className="col-md-4 reveal"
                    style={{
                      transitionDelay:
                        `${index * 0.1}s`,
                    }}
                  >

                    <div
                      className="glass glass-card h-100"
                    >

                      <div
                        className="d-flex align-items-center justify-content-center mb-4"
                        style={{
                          width:
                            58,

                          height:
                            58,

                          borderRadius:
                            16,

                          background:
                            'var(--accent-soft)',
                        }}
                      >

                        <Icon
                          size={24}
                          className="text-accent"
                        />

                      </div>


                      <div
                        className="eyebrow mb-2"
                      >
                        {role.subtitle}
                      </div>


                      <h5
                        className="fw-bold mb-2"
                      >
                        {role.title}
                      </h5>


                      <p
                        className="text-muted-swu mb-0"
                        style={{
                          fontSize:
                            '0.88rem',
                        }}
                      >
                        {role.desc}
                      </p>

                    </div>

                  </div>

                )

              }
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          STATS
      ====================================================== */}

      <section
        id="about"
        className="py-5"
      >

        <div
          className="container py-4"
        >

          <div
            className="row g-4"
          >

            {stats.map(
              (stat) => (

                <div
                  key={
                    stat.label
                  }
                  className="col-6 col-lg-3"
                >

                  <StatCard
                    {...stat}
                  />

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          CTA
      ====================================================== */}

      <section
        id="contact"
        className="py-5"
      >

        <div
          className="container py-4"
        >

          <div
            className="glass-strong position-relative overflow-hidden text-center px-4 py-5 reveal"
          >

            <ParticleBackground
              count={16}
            />


            <div
              className="position-relative"
            >

              <FiShield
                size={34}
                className="text-accent mb-3"
              />


              <h2
                className="font-display fw-bold mb-3"
              >
                Stay Connected. Stay Protected.
              </h2>


              <p
                className="text-muted-swu mb-4 mx-auto"
                style={{
                  maxWidth:
                    460,
                }}
              >

                Build your trusted safety network and stay connected
                with the people who matter when every second counts.

              </p>


              <button
                className="btn btn-swu-primary d-inline-flex align-items-center gap-2"
                onClick={() =>
                  navigate(
                    '/register'
                  )
                }
                type="button"
              >

                Get Started Now

                <FiArrowRight />

              </button>

            </div>

          </div>

        </div>

      </section>

    </MainLayout>

  )
}