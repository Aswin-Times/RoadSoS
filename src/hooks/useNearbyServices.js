import { useState, useEffect } from 'react'
import { db } from '../store/db'
import { useAppStore } from '../store/useAppStore'

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function useNearbyServices(radius = 5000) {
  const { location, isOnline } = useAppStore()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usingCache, setUsingCache] = useState(false)

  useEffect(() => {
    if (!location) return

    const fetchServices = async () => {
      setLoading(true)
      
      // Load from cache first
      try {
        const cached = await db.nearbyServices.toArray()
        if (cached.length > 0) {
          // Filter by distance and sort
          const updatedCache = cached.map(s => ({
            ...s,
            distance: calculateDistance(location.lat, location.lng, s.lat, s.lng).toFixed(1)
          })).sort((a, b) => a.distance - b.distance)
          
          setServices(updatedCache)
          setUsingCache(true)
        }
      } catch (e) {
        console.error("Cache read error", e)
      }

      if (!isOnline) {
        setLoading(false)
        return
      }

      // Fetch from Overpass API
      try {
        // Build Overpass query: look for hospitals, clinics, police, fire stations
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
            node["amenity"="clinic"](around:${radius},${location.lat},${location.lng});
            node["amenity"="police"](around:${radius},${location.lat},${location.lng});
            node["amenity"="fire_station"](around:${radius},${location.lat},${location.lng});
            node["healthcare"="ambulance"](around:${radius},${location.lat},${location.lng});
          );
          out body;
          >;
          out skel qt;
        `
        
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        })
        
        if (!response.ok) throw new Error("Network response was not ok")
        
        const data = await response.json()
        
        const parsedServices = data.elements
          .filter(e => e.type === 'node' && e.tags)
          .map(e => {
            let type = 'other'
            if (e.tags.amenity === 'hospital' || e.tags.amenity === 'clinic') type = 'hospital'
            else if (e.tags.amenity === 'police') type = 'police'
            else if (e.tags.amenity === 'fire_station' || e.tags.healthcare === 'ambulance') type = 'ambulance'
            
            return {
              id: e.id.toString(),
              type,
              name: e.tags.name || `${type.charAt(0).toUpperCase() + type.slice(1)} (Unknown Name)`,
              lat: e.lat,
              lng: e.lon,
              phone: e.tags.phone || e.tags['contact:phone'] || null,
              distance: calculateDistance(location.lat, location.lng, e.lat, e.lon).toFixed(1),
              cached_at: Date.now(),
              tags: e.tags
            }
          })
          .sort((a, b) => a.distance - b.distance)

        setServices(parsedServices)
        setUsingCache(false)
        
        // Update cache
        await db.nearbyServices.clear()
        await db.nearbyServices.bulkAdd(parsedServices)
        
      } catch (err) {
        console.error("Overpass API error:", err)
        setError(err.message)
        // Keep using cache if API failed
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [location, isOnline, radius])

  return { services, loading, error, usingCache }
}
