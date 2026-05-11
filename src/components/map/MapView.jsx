import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { LocateFixed, MapPin } from 'lucide-react'
import L from 'leaflet'
import { useAppStore } from '../../store/useAppStore'

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const UserMarker = ({ location, accuracy }) => {
  const map = useMap()
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 15)
    }
  }, [location, map])

  const customIcon = L.divIcon({
    className: 'bg-transparent',
    html: `
      <div class="relative w-6 h-6">
        <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div>
        <div class="absolute inset-1 bg-blue-600 rounded-full border-2 border-white"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })

  if (!location) return null

  return (
    <>
      <Marker position={[location.lat, location.lng]} icon={customIcon} />
      {accuracy && <Circle center={[location.lat, location.lng]} radius={accuracy} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 1 }} />}
      {/* Distance rings */}
      <Circle center={[location.lat, location.lng]} radius={1000} pathOptions={{ color: 'rgba(255,255,255,0.2)', weight: 1, dashArray: '5, 5', fill: false }} />
      <Circle center={[location.lat, location.lng]} radius={3000} pathOptions={{ color: 'rgba(255,255,255,0.1)', weight: 1, dashArray: '5, 5', fill: false }} />
      <Circle center={[location.lat, location.lng]} radius={5000} pathOptions={{ color: 'rgba(255,255,255,0.05)', weight: 1, dashArray: '5, 5', fill: false }} />
    </>
  )
}

export default function MapView({ services = [] }) {
  const { location, locationAccuracy } = useAppStore()
  const mapRef = useRef(null)
  const [tilesLoaded, setTilesLoaded] = useState(false)

  const handleLocateMe = () => {
    if (mapRef.current && location) {
      mapRef.current.flyTo([location.lat, location.lng], 16)
    }
  }

  const getServiceIcon = (type) => {
    const markers = {
      hospital: `
        <svg width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="Hospital marker">
          <filter id="s"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity=".45"/></filter>
          <circle cx="16" cy="16" r="14" fill="#F0EDE8" filter="url(#s)"/>
          <path d="M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6z" fill="#E8361A"/>
        </svg>`,
      police: `
        <svg width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="Police marker">
          <filter id="p"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity=".45"/></filter>
          <path d="M16 3l11 4v8c0 7-4.5 11.5-11 14C9.5 26.5 5 22 5 15V7z" fill="#2563EB" filter="url(#p)"/>
          <path d="M16 9l1.7 3.4 3.8.5-2.7 2.7.6 3.8L16 17.6l-3.4 1.8.6-3.8-2.7-2.7 3.8-.5z" fill="#F0EDE8"/>
        </svg>`,
      ambulance: `
        <svg width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="Ambulance marker">
          <filter id="a"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity=".45"/></filter>
          <circle cx="16" cy="16" r="14" fill="#F59E0B" filter="url(#a)"/>
          <path d="M16 6l2.2 6.2 5.8-3-3 5.8 6 1-6 1 3 5.8-5.8-3L16 26l-2.2-6.2-5.8 3 3-5.8-6-1 6-1-3-5.8 5.8 3z" fill="#F0EDE8"/>
        </svg>`,
      towing: `
        <svg width="28" height="28" viewBox="0 0 28 28" role="img" aria-label="Towing marker">
          <filter id="t"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity=".45"/></filter>
          <circle cx="14" cy="14" r="13" fill="#5A5652" filter="url(#t)"/>
          <path d="M9 7h7l3 4v4h-2.2a3 3 0 01-5.6 0H9zm8 5h-3V9h1.7zM8 18h8v2H8a4 4 0 01-4-4h2a2 2 0 002 2z" fill="#F0EDE8"/>
        </svg>`,
    }

    return L.divIcon({
      className: 'bg-transparent service-map-marker',
      html: `<div class="marker-drop">${markers[type] || markers.towing}</div>`,
      iconSize: type === 'towing' ? [28, 28] : [32, 32],
      iconAnchor: [16, 16]
    })
  }

  return (
    <div className="relative z-0 h-full w-full bg-asphalt-800">
      {!tilesLoaded && (
        <div className="map-loading-grid absolute inset-0 z-[350] flex flex-col items-center justify-center gap-3 text-smoke-300 transition-opacity duration-500">
          <MapPin size={34} className="animate-sos-pulse text-emergency" aria-hidden="true" />
          <span className="text-caption">Locating you...</span>
        </div>
      )}
      <MapContainer 
        center={location ? [location.lat, location.lng] : [20.5937, 78.9629]} 
        zoom={location ? 15 : 5} 
        zoomControl={false}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
          eventHandlers={{ load: () => setTilesLoaded(true) }}
        />
        
        {/* Custom dark mode styling for the map via CSS filter */}
        <style>{`
          .leaflet-layer,
          .leaflet-control-zoom-in,
          .leaflet-control-zoom-out,
          .leaflet-control-attribution {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
          }
        `}</style>

        <UserMarker location={location} accuracy={locationAccuracy} />

        {services.map(service => (
          <Marker 
            key={service.id} 
            position={[service.lat, service.lng]}
            icon={getServiceIcon(service.type)}
          >
            <Popup className="custom-popup">
              <div className="p-1 font-body text-black">
                <h3 className="font-bold text-sm">{service.name}</h3>
                <p className="text-xs text-gray-600">{service.distance}km away</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Locate Me FAB */}
      <button 
        onClick={handleLocateMe}
        className="absolute bottom-6 right-4 z-[400] flex h-touch w-touch items-center justify-center rounded-full border border-smoke-500/30 bg-asphalt-700 text-smoke-100 shadow-card transition-transform hover:bg-asphalt-500 active:scale-95"
        aria-label="Center map on my location"
        title="Center map"
      >
        <LocateFixed size={20} className="text-emergency" aria-hidden="true" />
      </button>
    </div>
  )
}
