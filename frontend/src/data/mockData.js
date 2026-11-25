export const user = {
  name: 'Aanya Sharma',
  username: '@aanya.s',
  email: 'aanya.sharma@example.com',
  phone: '+91 98765 43210',
  avatar: 'AS',
  memberSince: 'March 2024',
  online: true,
}

export const currentLocation = {
  lat: 19.0760,
  lng: 72.8777,
  label: 'Bandra West, Mumbai',
  accuracy: '6 m',
  updated: '12 sec ago',
}

export const trustedContacts = [
  { id: 1, name: 'Rhea Kapoor', relation: 'Sister', phone: '+91 90000 11111', priority: 'Primary', status: 'online', initials: 'RK' },
  { id: 2, name: 'Vikram Sharma', relation: 'Father', phone: '+91 90000 22222', priority: 'Primary', status: 'online', initials: 'VS' },
  { id: 3, name: 'Neha Verma', relation: 'Friend', phone: '+91 90000 33333', priority: 'Secondary', status: 'offline', initials: 'NV' },
  { id: 4, name: 'Officer S. Rao', relation: 'Local Precinct', phone: '+91 90000 44444', priority: 'Emergency', status: 'online', initials: 'SR' },
]

export const alerts = [
  { id: 1, category: 'Emergency', title: 'SOS Test Completed', desc: 'Weekly emergency drill finished successfully — all contacts reachable.', time: '2h ago', read: false, level: 'high' },
  { id: 2, category: 'Location', title: 'Left Safe Zone: Home', desc: 'You exited the "Home" safety radius of 300m.', time: '5h ago', read: false, level: 'medium' },
  { id: 3, category: 'Safety', title: 'New Trusted Contact Added', desc: 'Neha Verma was added as a secondary contact.', time: '1d ago', read: true, level: 'low' },
  { id: 4, category: 'System', title: 'App Updated', desc: 'SafeWithUs updated to version 2.4.0 with faster location sync.', time: '3d ago', read: true, level: 'low' },
]

export const safetyZones = [
  { id: 1, name: 'Home', type: 'Safe Zone', radius: '300 m', status: 'active', created: 'Jan 2024' },
  { id: 2, name: 'Office — Lower Parel', type: 'Safe Zone', radius: '250 m', status: 'active', created: 'Feb 2024' },
  { id: 3, name: 'Old Warehouse District', type: 'Restricted Zone', radius: '500 m', status: 'active', created: 'Apr 2024' },
  { id: 4, name: 'College Campus', type: 'Frequent', radius: '400 m', status: 'inactive', created: 'Jun 2024' },
]

export const recentAlertsShort = [
  { id: 1, text: 'Location shared with Rhea Kapoor', time: '10 min ago' },
  { id: 2, text: 'Entered Safe Zone: Office', time: '3 h ago' },
  { id: 3, text: 'Weekly safety check complete', time: '1 d ago' },
]

export const stats = [
  { label: 'Safety Support', value: 24, suffix: '/7' },
  { label: 'Avg. Response Time', value: 12, suffix: 's' },
  { label: 'Trusted Contacts', value: 4, suffix: '' },
  { label: 'Locations Monitored', value: 3, suffix: '' },
]

export const howItWorks = [
  { step: '01', title: 'Register', desc: 'Create your SafeWithUs account in under a minute.' },
  { step: '02', title: 'Add Trusted Contacts', desc: 'Choose the people who get notified the moment something feels wrong.' },
  { step: '03', title: 'Configure Safety Settings', desc: 'Set safe zones, alert preferences and SOS behaviour.' },
  { step: '04', title: 'Use Emergency SOS', desc: 'One press shares your live location and alerts your circle instantly.' },
  { step: '05', title: 'Stay Connected', desc: 'Ongoing monitoring keeps your circle informed, wherever you go.' },
]
