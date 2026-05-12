export const generateGoogleMapsLink = (lat, lng) => {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

export const generateDirectionsLink = (lat, lng) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export const generateEmergencyMessage = (location, hospital) => {
  const mapsLink = generateGoogleMapsLink(location.lat, location.lng)
  return `EMERGENCY - I've been in a road accident. 
Location: ${mapsLink}
Coordinates: ${location.lat}, ${location.lng}
Nearest Hospital: ${hospital ? `${hospital.name} (${hospital.distance}km)` : 'Locating...'}
Please send help immediately.`
}

export const shareViaWhatsApp = (message) => {
  const encodedMessage = encodeURIComponent(message)
  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
}

export const shareViaSMS = (message) => {
  const encodedMessage = encodeURIComponent(message)
  window.open(`sms:?body=${encodedMessage}`, '_self')
}

export const vibrateDevice = (pattern = [200, 100, 200]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}
