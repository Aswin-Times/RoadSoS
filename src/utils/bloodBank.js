// Blood Bank Network Utility — Module 10
import bloodBanksData from '../data/blood_banks.json'

const DONOR_COOLDOWN_DAYS = 56

/**
 * Get inventory color based on unit count
 */
export function getInventoryColor(units) {
  if (units === null || units === undefined) return 'gray'
  if (units > 10) return 'green'
  if (units >= 3) return 'amber'
  return 'red'
}

/**
 * Get inventory label
 */
export function getInventoryLabel(units, type) {
  if (units === 0) return `${type} unavailable`
  if (units < 3) return `${type} critically low — ${units} units remaining`
  if (units <= 10) return `${type} limited — ${units} units`
  return `${type} available — ${units} units`
}

/**
 * Get all blood banks sorted by distance from user
 */
export function getNearbyBloodBanks(userLat, userLng, maxKm = 50) {
  return bloodBanksData.banks
    .map(bank => ({
      ...bank,
      distance: haversine(userLat, userLng, bank.lat, bank.lng)
    }))
    .filter(b => b.distance <= maxKm)
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Search blood banks by blood type availability
 */
export function findBloodType(type, userLat, userLng) {
  return getNearbyBloodBanks(userLat, userLng)
    .filter(bank => bank.inventory[type] > 0)
    .map(bank => ({
      ...bank,
      available: bank.inventory[type],
      color: getInventoryColor(bank.inventory[type])
    }))
}

/**
 * Create a blood request broadcast
 */
export function createBloodRequest({ bloodType, hospitalName, hospitalLat, hospitalLng, urgency = 'critical' }) {
  return {
    id: `br_${Date.now()}`,
    bloodType,
    hospitalName,
    hospitalLat,
    hospitalLng,
    urgency,
    createdAt: Date.now(),
    expiresAt: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
    respondedDonors: [],
    status: 'active'
  }
}

/**
 * Donor profile management
 */
export function createDonorProfile({ bloodType, lastDonationDate = null }) {
  const eligibleDate = lastDonationDate
    ? new Date(lastDonationDate).getTime() + DONOR_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    : 0
  return {
    bloodType,
    lastDonationDate,
    eligible: Date.now() >= eligibleDate,
    eligibleDate: eligibleDate > Date.now() ? new Date(eligibleDate).toISOString() : null,
    donations: 0,
    badges: []
  }
}

/**
 * Check donor eligibility
 */
export function isDonorEligible(lastDonationDate) {
  if (!lastDonationDate) return true
  const cooldownMs = DONOR_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - new Date(lastDonationDate).getTime() >= cooldownMs
}

/**
 * Get donor badges based on donation count
 */
export function getDonorBadges(donationCount) {
  const badges = []
  if (donationCount >= 1) badges.push({ name: 'First Donation Confirmed', icon: '🩸' })
  if (donationCount >= 5) badges.push({ name: 'Lifesaver x5', icon: '⭐' })
  if (donationCount >= 10) badges.push({ name: 'Blood Hero', icon: '🏆' })
  if (donationCount >= 25) badges.push({ name: 'Guardian Angel', icon: '👼' })
  return badges
}

/**
 * Generate ride deep link for donor transport
 */
export function getDonorTransportLink(hospitalLat, hospitalLng, hospitalName) {
  return {
    uber: `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${hospitalLat}&dropoff[longitude]=${hospitalLng}&dropoff[nickname]=${encodeURIComponent(hospitalName)}`,
    ola: `https://book.olacabs.com/?lat=${hospitalLat}&lng=${hospitalLng}&name=${encodeURIComponent(hospitalName)}`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${hospitalLat},${hospitalLng}&travelmode=driving`
  }
}

/**
 * Haversine formula for distance calculation
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
