import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { ArrowLeft, Plus, QrCode, ShieldCheck } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { useAppStore } from '../store/useAppStore'
import { generateMedicalSummary } from '../utils/aiCopilot'
import { db } from '../store/db'

function ChipInput({ label, values, onChange, placeholder }) {
  const [value, setValue] = useState('')
  const addValue = () => {
    if (!value.trim()) return
    onChange([...values, value.trim()])
    setValue('')
  }
  return (
    <div>
      <label className="text-label text-smoke-300">{label}</label>
      <div className="mt-2 flex gap-2">
        <input className="min-h-touch flex-1 rounded-card border border-smoke-500/25 bg-asphalt-900 px-3 text-body" value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} />
        <button className="btn-ghost w-touch" type="button" onClick={addValue} aria-label={`Add ${label}`}><Plus size={18} /></button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((item) => (
          <button key={item} className="rounded-pill bg-asphalt-500 px-3 py-2 text-caption" type="button" onClick={() => onChange(values.filter((valueItem) => valueItem !== item))}>{item}</button>
        ))}
      </div>
    </div>
  )
}

export default function MedicalProfile() {
  const navigate = useNavigate()
  const { userName, bloodGroup, setBloodGroup, medicalProfile, setMedicalProfile } = useAppStore()
  const [qr, setQr] = useState('')

  const summary = generateMedicalSummary({ bloodGroup, ...medicalProfile })

  useEffect(() => {
    setMedicalProfile({ aiSummary: summary })
  }, [summary, setMedicalProfile])

  const generateQR = async () => {
    const data = JSON.stringify({
      name: userName,
      bloodGroup,
      allergies: medicalProfile.allergies,
      medications: medicalProfile.medications,
      conditions: medicalProfile.conditions,
      nextOfKin: medicalProfile.nextOfKin
    })
    const url = await QRCode.toDataURL(data)
    setQr(url)
  }

  return (
    <div className="flex h-screen flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      <header className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/settings')} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full" aria-label="Back"><ArrowLeft /></button>
          <h1 className="text-display-md">Medical Profile</h1>
        </div>
      </header>
      <main className="bottom-fade flex-1 space-y-5 overflow-y-auto px-gutter py-5">
        <section className="rounded-card border border-emergency/25 bg-emergency-muted p-card-pad">
          <div className="mb-2 flex items-center gap-2 text-label text-emergency"><ShieldCheck size={16} /> ER Summary Card</div>
          <pre className="whitespace-pre-wrap font-mono text-[14px] text-smoke-100">{summary}</pre>
        </section>
        <label className="block">
          <span className="text-label text-smoke-300">Blood Group</span>
          <input value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value.toUpperCase())} className="mt-2 min-h-touch w-full rounded-card border border-smoke-500/25 bg-asphalt-700 px-3 font-mono text-[18px]" placeholder="O+" maxLength={3} />
        </label>
        <ChipInput label="Allergies" values={medicalProfile.allergies} onChange={(allergies) => setMedicalProfile({ allergies })} placeholder="Penicillin" />
        <ChipInput label="Medications" values={medicalProfile.medications} onChange={(medications) => setMedicalProfile({ medications })} placeholder="Warfarin 5mg" />
        <ChipInput label="Conditions" values={medicalProfile.conditions} onChange={(conditions) => setMedicalProfile({ conditions })} placeholder="Diabetes" />
        <label className="block">
          <span className="text-label text-smoke-300">Emergency Directive</span>
          <textarea value={medicalProfile.directive} onChange={(event) => setMedicalProfile({ directive: event.target.value })} className="mt-2 min-h-[96px] w-full rounded-card border border-smoke-500/25 bg-asphalt-700 p-3 text-body" placeholder="DNR, organ donor, or other directive" />
        </label>
        <button onClick={generateQR} className="btn-primary w-full gap-2"><QrCode size={18} /> Generate QR ID</button>
        {qr && <img src={qr} alt="Temporary medical profile QR code" className="mx-auto h-44 w-44 rounded-card bg-smoke-100 p-3" />}
      </main>
    </div>
  )
}
