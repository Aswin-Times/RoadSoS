import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../store/db'
import { useAppStore } from '../store/useAppStore'

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function useCommunityData() {
  const { userName } = useAppStore()

  useEffect(() => {
    const seed = async () => {
      try {
        const existing = await db.communityResponders.count()
        if (existing === 0) {
          await db.communityResponders.bulkAdd([
            { name: userName || 'You', responses: 0, badge: '🆕', training: 'Newcomer' },
            { name: 'Anonymous Helper', responses: 28, badge: '🏆', training: 'CPR Certified' },
            { name: 'Road Guardian', responses: 21, badge: '⭐', training: 'First Responder' },
            { name: 'Safe Driver', responses: 15, badge: '🛡️', training: 'Basic Trained' },
            { name: 'Night Watch', responses: 12, badge: '🩸', training: 'Blood Donor' },
          ])
        }
      } catch (e) {
        console.error("Failed to seed leaderboard", e)
      }
    }
    seed()
  }, [userName])

  const allHazards = useLiveQuery(() => db.hazards.toArray()) || []
  const sosHistory = useLiveQuery(() => db.sosHistory.toArray()) || []
  const leaderboardItems = useLiveQuery(() => db.communityResponders.toArray()) || []

  // Derive blackspots
  const blackSpotsMap = {}
  sosHistory.forEach(sos => {
    let matched = false
    for (const key in blackSpotsMap) {
      const spot = blackSpotsMap[key]
      if (calculateDistance(sos.lat, sos.lng, spot.lat, spot.lng) <= 0.5) {
        spot.incidents += 1
        matched = true
        break
      }
    }
    if (!matched) {
      blackSpotsMap[sos.id] = { id: sos.id, lat: sos.lat, lng: sos.lng, incidents: 1, location: `Near ${sos.lat.toFixed(3)}, ${sos.lng.toFixed(3)}` }
    }
  })

  const blackSpots = Object.values(blackSpotsMap)
    .filter(spot => spot.incidents >= 3)
    .map(spot => ({
      ...spot,
      severity: spot.incidents > 10 ? 'critical' : spot.incidents > 5 ? 'confirmed' : 'emerging',
      trend: 'rising'
    }))

  const potholes = allHazards.filter(h => h.type === 'Pothole').map(p => ({
    id: p.id,
    severity: p.verified ? 'high' : 'medium',
    location: p.location ? `Near ${p.location.lat.toFixed(3)}, ${p.location.lng.toFixed(3)}` : 'Unknown location',
    reports: p.verified ? 5 : 1,
    lastReported: 'recently'
  }))

  const hazards = allHazards.filter(h => h.type !== 'Pothole')
  
  const leaderboard = [...leaderboardItems].sort((a, b) => b.responses - a.responses).map((item, index) => ({
    ...item,
    rank: index + 1
  }))

  return { hazards, blackSpots, potholes, leaderboard }
}
