import Dexie from 'dexie'

export const db = new Dexie('RoadRescueDB')

db.version(1).stores({
  nearbyServices: 'id, type, name, distance, cached_at',
  userContacts: 'id, name, phone, relationship',
  sosHistory: 'id, timestamp, lat, lng'
})

db.version(2).stores({
  nearbyServices: 'id, type, name, distance, cached_at',
  userContacts: 'id, name, phone, relationship',
  sosHistory: 'id, timestamp, lat, lng, status',
  evidencePackages: 'id, incidentId, timestamp, hash',
  incidentVault: 'id, timestamp, status, hash',
  tamperLog: '++seq, incidentId, timestamp, hash, prev_hash',
  hazards: 'id, type, timestamp, expiresAt, verified',
  hospitalRatings: '++id, hospitalId, timestamp',
  vitalsLog: '++id, incidentId, timestamp',
  profileShares: 'id, expiresAt',
})
