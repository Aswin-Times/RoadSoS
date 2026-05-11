// Environmental Hazard Intelligence — Module 12

/**
 * Pre-Trip Risk Scoring Engine
 * Weighs historical accident rate, weather, time of day, road type, and events
 */
export function calculateTripRisk({ departureTime, routeType = 'NH', weatherCode = 800 }) {
  let score = 3.0 // base

  // Time-of-day multiplier
  const hour = new Date(departureTime).getHours()
  if (hour >= 22 || hour < 5) score *= 1.8       // night
  else if (hour >= 5 && hour < 7) score *= 1.4   // dawn
  else if (hour >= 17 && hour < 19) score *= 1.4  // dusk
  else score *= 1.0

  // Road type risk
  const roadMultipliers = { NH: 0.8, SH: 1.2, district: 1.5, urban: 1.0 }
  score *= (roadMultipliers[routeType] || 1.0)

  // Weather risk
  if (weatherCode >= 200 && weatherCode < 300) score *= 1.6  // Thunderstorm
  else if (weatherCode >= 500 && weatherCode < 600) score *= 1.4 // Rain
  else if (weatherCode >= 600 && weatherCode < 700) score *= 1.5 // Snow
  else if (weatherCode >= 700 && weatherCode < 800) score *= 1.3 // Fog/Haze

  // Clamp to 1-10
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10))
}

/**
 * Get hazard descriptions based on risk factors
 */
export function getRouteHazards({ departureTime, weatherCode, routeType }) {
  const hazards = []
  const hour = new Date(departureTime).getHours()

  if (hour >= 22 || hour < 5) hazards.push({ type: 'night', desc: 'Reduced visibility — night driving', severity: 'high' })
  if (hour >= 5 && hour < 7) hazards.push({ type: 'dawn', desc: 'Low sun glare at dawn', severity: 'medium' })
  if (weatherCode >= 700 && weatherCode < 800) hazards.push({ type: 'fog', desc: 'Fog/haze likely — maintain safe distance', severity: 'high' })
  if (weatherCode >= 500 && weatherCode < 600) hazards.push({ type: 'rain', desc: 'Wet road surface — reduced traction', severity: 'medium' })
  if (weatherCode >= 200 && weatherCode < 300) hazards.push({ type: 'storm', desc: 'Thunderstorm — avoid open roads', severity: 'critical' })
  if (routeType === 'district') hazards.push({ type: 'road', desc: 'District road — uneven surface likely', severity: 'medium' })

  return hazards.slice(0, 3)
}

/**
 * Pothole Detection — Z-axis spike pattern matching
 * Analyzes accelerometer data for pothole signatures
 */
export function detectPothole(accelerometerData) {
  // accelerometerData: array of { z, timestamp }
  // Pattern: sharp 2g spike, <0.3s duration, symmetric
  const THRESHOLD_G = 2.0
  const MAX_DURATION_MS = 300

  const detections = []
  let spikeStart = null

  for (let i = 1; i < accelerometerData.length; i++) {
    const delta = Math.abs(accelerometerData[i].z - accelerometerData[i - 1].z)

    if (delta >= THRESHOLD_G && !spikeStart) {
      spikeStart = { index: i, time: accelerometerData[i].timestamp }
    } else if (spikeStart && delta < THRESHOLD_G * 0.3) {
      const duration = accelerometerData[i].timestamp - spikeStart.time
      if (duration <= MAX_DURATION_MS) {
        detections.push({
          timestamp: spikeStart.time,
          severity_g: delta,
          duration_ms: duration
        })
      }
      spikeStart = null
    }
  }

  return detections
}

/**
 * Flood risk assessment based on rainfall data
 */
export function assessFloodRisk(rainfallMm, drainageCapacity = 'normal') {
  const drainMult = { poor: 0.5, normal: 1.0, good: 1.5 }
  const effectiveCapacity = 30 * (drainMult[drainageCapacity] || 1.0)

  if (rainfallMm > effectiveCapacity * 2) return { level: 'critical', desc: 'Severe waterlogging expected', color: '#E8361A' }
  if (rainfallMm > effectiveCapacity) return { level: 'high', desc: 'Road flooding likely', color: '#F59E0B' }
  if (rainfallMm > effectiveCapacity * 0.7) return { level: 'moderate', desc: 'Standing water possible', color: '#F59E0B' }
  return { level: 'low', desc: 'Normal conditions', color: '#22C55E' }
}

/**
 * AQI Health Alert for drivers
 */
export function getAqiAlert(aqi) {
  if (aqi > 300) return { level: 'hazardous', msg: 'Air quality hazardous. Avoid driving if possible. Use N95 mask.', breakInterval: 60, color: '#7D1128' }
  if (aqi > 200) return { level: 'severe', msg: 'Air quality severe. Take a break every 90 minutes. Keep windows closed.', breakInterval: 90, color: '#E8361A' }
  if (aqi > 150) return { level: 'unhealthy', msg: 'Air quality unhealthy. Take breaks every 2 hours.', breakInterval: 120, color: '#F59E0B' }
  if (aqi > 100) return { level: 'moderate', msg: 'Air quality moderate. Open vents only in low-AQI zones.', breakInterval: 180, color: '#F59E0B' }
  return { level: 'good', msg: 'Air quality is good. Drive safely.', breakInterval: null, color: '#22C55E' }
}

/**
 * Black Spot Algorithm — DBSCAN clustering
 */
export function detectBlackSpots(incidents, eps = 50, minPts = 3) {
  // Simple distance-based clustering for demo
  const clusters = []
  const visited = new Set()

  for (let i = 0; i < incidents.length; i++) {
    if (visited.has(i)) continue

    const neighbors = incidents.filter((inc, j) => {
      if (j === i) return false
      const dist = haversineMeters(incidents[i].lat, incidents[i].lng, inc.lat, inc.lng)
      return dist <= eps
    })

    if (neighbors.length >= minPts - 1) {
      visited.add(i)
      const cluster = [incidents[i], ...neighbors]
      const center = {
        lat: cluster.reduce((s, c) => s + c.lat, 0) / cluster.length,
        lng: cluster.reduce((s, c) => s + c.lng, 0) / cluster.length
      }

      let severity = 'emerging'
      if (cluster.length >= 10) severity = 'critical'
      else if (cluster.length >= 5) severity = 'confirmed'

      clusters.push({ center, count: cluster.length, severity, incidents: cluster })
    }
  }

  return clusters
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
