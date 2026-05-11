import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, ShieldCheck } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { db } from '../store/db'
import { buildEvidenceZip, buildIncidentPdf } from '../utils/evidenceVault'

export default function IncidentVault() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState([])
  const [selected, setSelected] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    db.incidentVault.orderBy('timestamp').reverse().toArray().then(setIncidents)
  }, [])

  useEffect(() => {
    if (!selected) return
    db.tamperLog.where('incidentId').equals(selected.id).toArray().then(setLogs)
  }, [selected])

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportZip = async (incident) => {
    const blob = await buildEvidenceZip(incident)
    downloadBlob(blob, `road-rescue-${incident.id}.zip`)
  }

  const exportPdf = async (incident) => {
    const evidence = await db.evidencePackages.where('incidentId').equals(incident.id).toArray()
    downloadBlob(buildIncidentPdf(incident, evidence), `incident-${incident.id}.pdf`)
  }

  return (
    <div className="flex h-screen flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      <header className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/settings')} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full" aria-label="Back"><ArrowLeft /></button>
          <h1 className="text-display-md">Incident Vault</h1>
        </div>
      </header>
      <main className="bottom-fade flex-1 overflow-y-auto px-gutter py-5">
        {!selected ? (
          <div className="space-y-3">
            {incidents.length === 0 && (
              <div className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad text-center">
                <ShieldCheck className="mx-auto mb-3 text-safe" />
                <p className="text-heading">No sealed incidents yet</p>
                <p className="text-body text-smoke-300">Crash detection or SOS evidence will appear here.</p>
              </div>
            )}
            {incidents.map((incident) => (
              <button key={incident.id} onClick={() => setSelected(incident)} className="service-card w-full p-card-pad text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-heading">{new Date(incident.timestamp).toLocaleString()}</div>
                    <div className="text-coords mt-1 text-emergency">{incident.lat || 'GPS'}, {incident.lng || 'pending'}</div>
                  </div>
                  <span className="rounded-pill bg-asphalt-500 px-3 py-1 text-label text-smoke-300">{incident.status}</span>
                </div>
                <div className="mt-3 truncate font-mono text-[12px] text-smoke-400">{incident.hash}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <button className="text-label text-emergency" onClick={() => setSelected(null)}>Back to incidents</button>
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <h2 className="text-heading">Evidence Chain</h2>
              <p className="text-body text-smoke-300">Each write is linked by SHA-256 to the previous write.</p>
              <div className="mt-4 space-y-2">
                {logs.map((log) => (
                  <div key={log.seq} className="rounded-sharp bg-asphalt-900 p-3">
                    <div className="text-caption">{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="truncate font-mono text-[12px] text-safe">{log.hash}</div>
                    <div className="truncate font-mono text-[11px] text-smoke-400">prev: {log.prev_hash || 'genesis'}</div>
                  </div>
                ))}
              </div>
            </section>
            <button className="btn-primary w-full gap-2" onClick={() => exportZip(selected)}><Download size={18} /> Export ZIP</button>
            <button className="btn-ghost w-full gap-2" onClick={() => exportPdf(selected)}><FileText size={18} /> FIR / Report PDF</button>
          </div>
        )}
      </main>
    </div>
  )
}
