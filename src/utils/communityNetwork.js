import { db } from '../store/db'

export async function broadcastIncident({ location, injuryType }) {
  const incident = {
    id: `inc-${Date.now()}`,
    lat: location?.lat,
    lng: location?.lng,
    timestamp: new Date().toISOString(),
    injury_type: injuryType || 'unknown',
    status: 'active',
    responders: Math.floor(Math.random() * 4),
  }
  await db.sosHistory.put(incident)
  return incident
}

export async function reportHazard({ type, location }) {
  const hazard = {
    id: `haz-${Date.now()}`,
    type,
    lat: location?.lat,
    lng: location?.lng,
    timestamp: Date.now(),
    expiresAt: Date.now() + 2 * 60 * 60 * 1000,
    reports: 1,
    verified: false,
  }
  await db.hazards.put(hazard)
  return hazard
}

export async function activeHazards() {
  const now = Date.now()
  return db.hazards.filter((hazard) => hazard.expiresAt > now).toArray()
}
