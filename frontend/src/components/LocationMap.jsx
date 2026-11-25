import React, { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'


// --------------------------------------------------
// Fix Leaflet marker icon
// --------------------------------------------------

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})


// --------------------------------------------------
// Move map when location changes
// --------------------------------------------------

function MapUpdater({ latitude, longitude }) {

  const map = useMap()

  useEffect(() => {

    if (
      latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined
    ) {

      map.setView(
        [latitude, longitude],
        16
      )

    }

  }, [latitude, longitude, map])

  return null
}


// --------------------------------------------------
// Location Map
// --------------------------------------------------

export default function LocationMap({
  latitude,
  longitude,
  accuracy = 50,
}) {

  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {

    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
        }}
      >
        <span className="text-danger-swu">
          Location unavailable
        </span>
      </div>
    )

  }


  const position = [
    Number(latitude),
    Number(longitude),
  ]


  return (
    <MapContainer
      center={position}
      zoom={16}
      scrollWheelZoom={true}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 460,
      }}
    >

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      <MapUpdater
        latitude={Number(latitude)}
        longitude={Number(longitude)}
      />


      {/* GPS accuracy area */}

      <Circle
        center={position}
        radius={Number(accuracy) || 50}
        pathOptions={{
          color: '#26e0c9',
          fillColor: '#26e0c9',
          fillOpacity: 0.15,
          weight: 2,
        }}
      />


      {/* Current location */}

      <Marker position={position}>

        <Popup>

          <strong>
            Your Current Location
          </strong>

          <br />

          Latitude:
          {' '}
          {Number(latitude).toFixed(6)}

          <br />

          Longitude:
          {' '}
          {Number(longitude).toFixed(6)}

        </Popup>

      </Marker>

    </MapContainer>
  )
}