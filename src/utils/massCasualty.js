// Mass Casualty Incident Coordinator — Module 20

export const TRIAGE_COLORS = {
  black: { label: 'Deceased', color: '#1a1a1a', priority: 4 },
  red: { label: 'Immediate', color: '#E8361A', priority: 1 },
  yellow: { label: 'Delayed', color: '#F59E0B', priority: 2 },
  green: { label: 'Minor', color: '#22C55E', priority: 3 }
}

// START Triage decision tree
export function triageVictim(answers) {
  const { breathing, respRate, radialPulse, followsCommands } = answers
  if (!breathing) return 'black'
  if (respRate > 30) return 'red'
  if (!radialPulse) return 'red'
  if (!followsCommands) return 'red'
  return respRate > 10 ? 'yellow' : 'green'
}

export function generateTriageSummary(victims) {
  const summary = { red: 0, yellow: 0, green: 0, black: 0 }
  victims.forEach(v => { summary[v.triage]++ })
  return summary
}

export function formatTriageForSOS(summary) {
  const parts = []
  if (summary.red) parts.push(`${summary.red} Red (immediate)`)
  if (summary.yellow) parts.push(`${summary.yellow} Yellow (delayed)`)
  if (summary.green) parts.push(`${summary.green} Green (walking)`)
  if (summary.black) parts.push(`${summary.black} Black (deceased)`)
  return `MASS CASUALTY: ${parts.join(', ')}`
}

// Bystander role assignment
export function assignRoles(bystanders, victims) {
  const sorted = [...bystanders].sort((a, b) => {
    const rank = { 'Medical Professional': 4, 'CPR Certified': 3, 'Basic First Aid': 2, 'None': 1 }
    return (rank[b.training] || 0) - (rank[a.training] || 0)
  })

  const redVictims = victims.filter(v => v.triage === 'red')
  const assignments = []
  let bystanderIdx = 0

  // Assign medical professionals to red victims first
  redVictims.forEach((victim, i) => {
    if (bystanderIdx < sorted.length) {
      const b = sorted[bystanderIdx++]
      const task = b.training === 'Medical Professional' ? `Assess and manage ${victim.injury || 'injuries'}` :
        b.training === 'CPR Certified' ? `CPR on Victim ${i + 1}` : `Monitor Victim ${i + 1}, keep them talking`
      assignments.push({ bystander: b.name, training: b.training, victim: `Victim ${i + 1}`, task })
    }
  })

  // Remaining bystanders get support roles
  while (bystanderIdx < sorted.length) {
    const b = sorted[bystanderIdx++]
    if (b.training === 'None') {
      assignments.push({ bystander: b.name, training: b.training, victim: null, task: 'Call emergency services, then guide traffic away' })
    } else {
      assignments.push({ bystander: b.name, training: b.training, victim: null, task: 'Assist with triage of remaining victims' })
    }
  }
  return assignments
}

// Multi-hospital load balancer
export function balanceHospitalLoad(victims, hospitals) {
  const plan = []
  const load = {}
  hospitals.forEach(h => { load[h.id] = 0 })

  const sorted = [...victims].sort((a, b) => TRIAGE_COLORS[a.triage].priority - TRIAGE_COLORS[b.triage].priority)

  sorted.forEach(victim => {
    let best = null, bestScore = Infinity
    hospitals.forEach(h => {
      if (!h.capabilities) h.capabilities = []
      const hasSpecialty = h.capabilities.includes(victim.injuryType) ? -10 : 0
      const score = h.distance + (load[h.id] || 0) * 2 + hasSpecialty
      if (score < bestScore) { bestScore = score; best = h }
    })
    if (best) {
      plan.push({ victim, hospital: best, distance: best.distance })
      load[best.id] = (load[best.id] || 0) + 1
    }
  })
  return plan
}

// Post-incident debrief timeline
export function generateDebrief(events) {
  return events.map(e => ({
    time: new Date(e.timestamp).toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    description: e.description,
    type: e.type || 'event'
  }))
}
