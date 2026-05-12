const TRIAGE_PROMPT = `You are a trauma triage assistant. The user is at a road accident scene.
Respond ONLY in JSON. Classify urgency P1/P2/P3. Return immediate_actions
as an array of ≤4 steps. Never ask clarifying questions. Act on what you know.
P1 = life-threatening, P2 = serious but stable, P3 = minor.`

const ruleMap = [
  {
    match: /(not breathing|unconscious|no pulse|severe bleeding|head injury|spine|neck|chest pain|trapped)/i,
    urgency: 'P1',
    category: 'life-threatening trauma',
    first_aid_module: 'cpr',
    immediate_actions: ['Call emergency services now', 'Do not move victim', 'Check breathing', 'Control major bleeding'],
  },
  {
    match: /(fracture|broken|bent|bone|cannot feel|numb|leg|arm)/i,
    urgency: 'P2',
    category: 'suspected fracture',
    first_aid_module: 'fracture',
    immediate_actions: ['Do not move victim', 'Immobilise limb', 'Apply cold pack', 'Call 108'],
  },
  {
    match: /(blood|bleeding|cut|laceration|wound)/i,
    urgency: 'P2',
    category: 'severe bleeding risk',
    first_aid_module: 'bleeding',
    immediate_actions: ['Apply direct pressure', 'Add more cloth if soaked', 'Elevate limb if safe', 'Call 108'],
  },
]

export function fallbackTriage(description = '') {
  const hit = ruleMap.find((rule) => rule.match.test(description)) || {
    urgency: 'P3',
    category: 'minor or unclear injury',
    first_aid_module: 'bleeding',
    immediate_actions: ['Move to safety if possible', 'Check for pain', 'Clean minor wounds', 'Monitor symptoms'],
  }

  return {
    urgency: hit.urgency,
    category: hit.category,
    immediate_actions: hit.immediate_actions.slice(0, 4),
    first_aid_module: hit.first_aid_module,
    warn_hospital: hit.urgency !== 'P3',
    source: 'offline-rules',
  }
}

export async function runTriage(description) {
  try {
    const response = await fetch('/api/triage', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ description }),
    })
    if (!response.ok) throw new Error('AI unavailable')
    return await response.json()
  } catch {
    return fallbackTriage(description)
  }
}

export function rankHospitals({ injuryType, hospitals = [] }) {
  const traumaNeed = /head|spine|fracture|bleeding|life/i.test(injuryType || '')
  return hospitals
    .map((hospital) => {
      const traumaBonus = traumaNeed && (hospital.has_trauma || hospital.specialisations?.includes('trauma')) ? -2 : 0
      const congestion = new Date().getHours() >= 18 ? 0.8 : 0.2
      const score = Number(hospital.distance || 99) + congestion + traumaBonus
      return { ...hospital, aiScore: score }
    })
    .sort((a, b) => a.aiScore - b.aiScore)
}

export function generateSosMessage({ coords, injuryDesc, nearestHospital, bloodGroup, medicalSummary }) {
  const coordText = coords ? `${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}` : 'GPS pending'
  const hospitalText = nearestHospital ? `${nearestHospital.name}` : 'nearest hospital unknown'
  return `EMERGENCY: Road accident at ${coordText}. Injury: ${injuryDesc || 'unknown'}; target hospital: ${hospitalText}. ${bloodGroup ? `Blood ${bloodGroup}. ` : ''}${medicalSummary || 'Please send urgent help.'}`
}

export function generateMedicalSummary({ bloodGroup, allergies = [], medications = [], conditions = [] }) {
  const allergyText = allergies.length ? `Allergic to ${allergies.join(', ')}.` : 'No allergies listed.'
  const medsText = medications.length ? `On ${medications.join(', ')}.` : 'No medication listed.'
  const conditionText = conditions.length ? conditions.join(', ') : 'No known chronic conditions.'
  return `${bloodGroup || 'Blood unknown'} | ${allergyText} ${medsText}\n${conditionText}`
}
