// Trauma & Mental Health Layer — Module 13

export const PCL5_QUESTIONS = [
  { id: 'q1', text: 'Repeated, disturbing memories or images of the accident?', scale: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'] },
  { id: 'q2', text: 'Feeling very upset when something reminded you of the accident?', scale: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'] },
  { id: 'q3', text: 'Avoiding thinking about or talking about the accident?', scale: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'] },
  { id: 'q4', text: 'Trouble falling or staying asleep?', scale: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'] },
  { id: 'q5', text: 'Feeling jumpy or easily startled?', scale: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'] }
]

export function interpretPCL5(totalScore) {
  if (totalScore >= 32) return { level: 'high', color: '#E8361A', title: 'High Risk', message: 'Your responses suggest significant stress. Please consider talking to a professional.', action: 'crisis_referral' }
  if (totalScore >= 20) return { level: 'moderate', color: '#F59E0B', title: 'Moderate Stress', message: 'You\'re experiencing some stress reactions. Consider talking to someone you trust.', action: 'suggest_helpline' }
  return { level: 'low', color: '#22C55E', title: 'Normal Response', message: 'Your stress levels appear normal. These reactions usually ease with time.', action: 'reassure' }
}

export const CRISIS_HELPLINES = {
  IN: [{ name: 'iCall', phone: '9152987821', desc: 'Psychosocial helpline by TISS' }, { name: 'Vandrevala Foundation', phone: '9999666555', desc: '24/7 mental health support' }],
  US: [{ name: 'SAMHSA', phone: '1-800-662-4357', desc: 'Substance abuse & mental health' }, { name: '988 Crisis', phone: '988', desc: '24/7 crisis support' }],
  UK: [{ name: 'Samaritans', phone: '116 123', desc: '24/7 emotional support' }, { name: 'Mind', phone: '0300 123 3393', desc: 'Mental health charity' }]
}

export const STRESS_RESPONSE_GUIDE = {
  doList: ['Speak slowly and calmly using their name', 'Maintain gentle eye contact', '"You are safe. Help is coming. I\'m staying with you."', 'Cover them with a blanket if available', 'Stay physically close but don\'t crowd them'],
  dontList: ['Don\'t demand information', 'Don\'t say "calm down"', 'Don\'t leave them alone', 'Don\'t describe their injuries to them', 'Don\'t make promises you can\'t keep']
}

export const FAMILY_TEMPLATES = {
  victimConscious: "I've been in a minor accident but I'm safe. I'm at {location}. {hospital} is nearby. I'll call you from there. Please don't worry — I'm okay.",
  bystanderSerious: "{name} has been in an accident and is receiving help. Ambulance is {eta} away. They are conscious. Please head to {hospital}. Location: {link}"
}

export const BREATHING_CONFIG = {
  phases: [
    { name: 'Inhale', duration: 4, color: '#3B82F6' },
    { name: 'Hold', duration: 7, color: '#8B5CF6' },
    { name: 'Exhale', duration: 8, color: '#22C55E' }
  ]
}

export function getCheckInSchedule(incidentTimestamp) {
  const base = new Date(incidentTimestamp).getTime()
  return [
    { day: 0, label: 'Day 0 — Emergency', time: base, type: 'emergency', completed: false },
    { day: 1, label: 'Day 1 — 24h Check-in', time: base + 86400000, type: 'pcl5', completed: false },
    { day: 3, label: 'Day 3 — 72h Check-in', time: base + 259200000, type: 'pcl5', completed: false },
    { day: 7, label: 'Day 7 — Weekly Review', time: base + 604800000, type: 'pcl5', completed: false },
    { day: 30, label: 'Day 30 — Monthly Review', time: base + 2592000000, type: 'pcl5', completed: false }
  ]
}
