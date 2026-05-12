import JSZip from 'jszip'
import { jsPDF } from 'jspdf'
import { db } from '../store/db'

const encoder = new TextEncoder()

export async function sha256(payload) {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload)
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function writeTamperLog(incidentId, data) {
  const previous = await db.tamperLog.where('incidentId').equals(incidentId).last()
  const entry = {
    incidentId,
    data,
    prev_hash: previous?.hash || null,
    timestamp: new Date().toISOString(),
    device_fingerprint: navigator.userAgent.slice(0, 120),
  }
  const hash = await sha256(entry)
  await db.tamperLog.add({ ...entry, hash })
  return hash
}

export async function sealEvidencePackage({ incidentId, location, motionHistory = [], speedHistory = [] }) {
  const sealed = {
    id: `ev-${Date.now()}`,
    incidentId,
    timestamp: new Date().toISOString(),
    location,
    motionHistory,
    speedHistory,
  }
  sealed.hash = await sha256(sealed)
  await db.evidencePackages.put(sealed)
  await db.incidentVault.put({
    id: incidentId,
    timestamp: sealed.timestamp,
    status: 'open',
    lat: location?.lat,
    lng: location?.lng,
    hash: sealed.hash,
  })
  await writeTamperLog(incidentId, sealed)

  try {
    const res = await fetch('/api/evidence-backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sealed)
    });
    if (!res.ok) throw new Error('Upload failed');
  } catch (err) {
    await db.evidence_upload_queue.put(sealed);
  }

  return sealed
}

export function buildIncidentPdf(incident, evidence = []) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Road Rescue Incident Report', 14, 18)
  doc.setFontSize(11)
  doc.text(`Incident: ${incident?.id || 'Unknown'}`, 14, 32)
  doc.text(`Timestamp: ${incident?.timestamp || 'Unknown'}`, 14, 40)
  doc.text(`Status: ${incident?.status || 'open'}`, 14, 48)
  doc.text(`Location: ${incident?.lat || 'GPS'} , ${incident?.lng || 'pending'}`, 14, 56)
  doc.text(`Evidence packages: ${evidence.length}`, 14, 70)
  evidence.slice(0, 4).forEach((item, index) => {
    doc.text(`${index + 1}. ${item.hash}`, 14, 82 + index * 8)
  })
  return doc.output('blob')
}

export async function buildEvidenceZip(incident) {
  const zip = new JSZip()
  const evidence = await db.evidencePackages.where('incidentId').equals(incident.id).toArray()
  const logs = await db.tamperLog.where('incidentId').equals(incident.id).toArray()
  zip.file('evidence_chain.json', JSON.stringify(logs, null, 2))
  zip.file('gps_track.json', JSON.stringify(evidence.flatMap((item) => item.speedHistory || []), null, 2))
  zip.file('vitals_log.json', JSON.stringify(await db.vitalsLog.where('incidentId').equals(incident.id).toArray(), null, 2))
  zip.file('incident_report.pdf', buildIncidentPdf(incident, evidence))
  return zip.generateAsync({ type: 'blob' })
}
