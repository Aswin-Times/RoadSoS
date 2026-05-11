// Training Academy Utility — Module 16
import drillsData from '../data/training_drills.json'

const STORAGE_KEY = 'roadsos-training'

function getTrainingState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { streak: 0, lastDrillDate: null, completedDrills: [], cprScores: [], badges: [], scenariosCompleted: 0 }
  } catch { return { streak: 0, lastDrillDate: null, completedDrills: [], cprScores: [], badges: [], scenariosCompleted: 0 } }
}

function saveTrainingState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getDailyDrill() {
  const state = getTrainingState()
  const today = new Date().toDateString()
  if (state.lastDrillDate === today && state.completedDrills.length > 0) {
    return { completed: true, drill: null, state }
  }
  const available = drillsData.drills.filter(d => !state.completedDrills.includes(d.id))
  if (available.length === 0) {
    state.completedDrills = []
    saveTrainingState(state)
    return { completed: false, drill: drillsData.drills[0], state }
  }
  return { completed: false, drill: available[Math.floor(Math.random() * available.length)], state }
}

export function completeDrill(drillId, correct) {
  const state = getTrainingState()
  const today = new Date().toDateString()
  state.completedDrills.push(drillId)
  if (state.lastDrillDate === today) {
    // already counted
  } else {
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    state.streak = state.lastDrillDate === yesterday ? state.streak + 1 : 1
  }
  state.lastDrillDate = today
  // Check badges
  if (state.streak >= 7 && !state.badges.includes('streak7')) state.badges.push('streak7')
  if (state.streak >= 30 && !state.badges.includes('streak30')) state.badges.push('streak30')
  saveTrainingState(state)
  return state
}

export function recordCprScore(score) {
  const state = getTrainingState()
  state.cprScores.push({ ...score, date: new Date().toISOString() })
  const recent3 = state.cprScores.slice(-3)
  if (recent3.length >= 3 && recent3.every(s => s.passed) && !state.badges.includes('cprCertified')) {
    state.badges.push('cprCertified')
  }
  saveTrainingState(state)
  return state
}

export function evaluateCprTaps(taps, durationMs = 30000) {
  if (taps.length < 5) return { rate: 0, consistency: 0, total: taps.length, passed: false, feedback: 'Not enough taps recorded.' }
  const intervals = []
  for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1])
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
  const rate = Math.round(60000 / avgInterval)
  const variance = intervals.reduce((s, v) => s + (v - avgInterval) ** 2, 0) / intervals.length
  const stdDev = Math.sqrt(variance)
  const consistency = Math.max(0, 100 - stdDev)
  const passed = rate >= 100 && rate <= 120 && taps.length >= 50
  const feedback = rate < 100 ? 'Too slow — aim for 100-120 BPM' : rate > 120 ? 'Too fast — slow down slightly' : 'Excellent rate!'
  return { rate, consistency: Math.round(consistency), total: taps.length, passed, feedback }
}

export function getTrainingBadges() {
  const state = getTrainingState()
  return (state.badges || []).map(id => drillsData.badges[id] || { name: id, icon: '🏅' })
}

export function getTrainingStats() {
  return getTrainingState()
}

export function getAllDrills() {
  return drillsData.drills
}

export function getDrillCategories() {
  return [...new Set(drillsData.drills.map(d => d.category))]
}
