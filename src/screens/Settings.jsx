import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Phone, Globe, Database, Plus, Trash2, HeartPulse, Archive, Users, Radio, Droplets, GraduationCap, Shield, Car, Clock, MapPin } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { useAppStore } from '../store/useAppStore'
import { db } from '../store/db'

export default function Settings() {
  const navigate = useNavigate()
  const { 
    userName, setUserName, 
    bloodGroup, setBloodGroup,
    emergencyContacts, addEmergencyContact, removeEmergencyContact,
    countryCode, setCountryCode,
    isDarkMode, toggleDarkMode,
    voiceOptIn, setVoiceOptIn,
    tremorMode, setTremorMode
  } = useAppStore()

  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [cacheSize, setCacheSize] = useState('Checking...')

  // Simple cache size check
  useState(() => {
    const checkCache = async () => {
      try {
        const count = await db.nearbyServices.count()
        setCacheSize(`${count} locations cached`)
      } catch {
        setCacheSize('Unknown')
      }
    }
    checkCache()
  }, [])

  const handleAddContact = (e) => {
    e.preventDefault()
    if (newContactName && newContactPhone && emergencyContacts.length < 5) {
      addEmergencyContact({ name: newContactName, phone: newContactPhone, relationship: 'Family' })
      setNewContactName('')
      setNewContactPhone('')
    }
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--color-background)]">
      <StatusBar />
      
      {/* Header */}
      <div className="pt-12 pb-4 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full active:bg-[var(--color-surface-2)]">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-display font-bold tracking-wider">SETTINGS</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-0 flex flex-col gap-6">
        
        {/* Profile */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <User size={16} /> PERSONAL INFO
          </h2>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Full Name</label>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Blood Group</label>
              <input 
                type="text" 
                value={bloodGroup} 
                onChange={(e) => setBloodGroup(e.target.value)}
                placeholder="O+"
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-2 mt-1 uppercase"
                maxLength={3}
              />
            </div>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <Phone size={16} /> EMERGENCY CONTACTS ({emergencyContacts.length}/5)
          </h2>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
            <div className="flex flex-col gap-3 mb-4">
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between bg-[var(--color-background)] p-3 rounded-lg border border-[var(--color-border)]">
                  <div>
                    <div className="font-bold text-sm">{contact.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)] font-mono">{contact.phone}</div>
                  </div>
                  <button onClick={() => removeEmergencyContact(contact.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {emergencyContacts.length === 0 && (
                <div className="text-center text-sm text-[var(--color-text-muted)] py-2">No contacts added yet.</div>
              )}
            </div>
            
            {emergencyContacts.length < 5 && (
              <form onSubmit={handleAddContact} className="flex gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
                    required
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <button type="submit" className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-4 flex items-center justify-center active:bg-[var(--color-surface)]">
                  <Plus size={20} />
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <Globe size={16} /> PREFERENCES
          </h2>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Country Code</div>
                <div className="text-xs text-[var(--color-text-muted)]">For correct emergency numbers</div>
              </div>
              <select 
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-sm"
              >
                <option value="IN">India (IN)</option>
                <option value="US">USA (US)</option>
                <option value="GB">UK (GB)</option>
                <option value="EU">Europe (EU)</option>
                <option value="AU">Australia (AU)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Dark Mode</div>
                <div className="text-xs text-[var(--color-text-muted)]">Recommended for battery saving</div>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-surface-2)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Voice Command Engine</div>
                <div className="text-xs text-[var(--color-text-muted)]">Keyword: rescue</div>
              </div>
              <button
                onClick={() => setVoiceOptIn(!voiceOptIn)}
                className={`w-12 h-6 rounded-full relative transition-colors ${voiceOptIn ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-surface-2)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${voiceOptIn ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">Tremor Mode</div>
                <div className="text-xs text-[var(--color-text-muted)]">Larger hold targets after crash</div>
              </div>
              <button
                onClick={() => setTremorMode(!tremorMode)}
                className={`w-12 h-6 rounded-full relative transition-colors ${tremorMode ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-surface-2)]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${tremorMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Layer 3 Deep Modules */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <Radio size={16} /> CORE MODULES
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => navigate('/medical-profile')} className="service-card flex min-h-touch items-center gap-3 p-card-pad text-left">
              <HeartPulse className="text-emergency" /> <span className="text-heading">Medical Profile</span>
            </button>
            <button onClick={() => navigate('/incident-vault')} className="service-card flex min-h-touch items-center gap-3 p-card-pad text-left">
              <Archive className="text-warning" /> <span className="text-heading">Incident Vault</span>
            </button>
            <button onClick={() => navigate('/community')} className="service-card flex min-h-touch items-center gap-3 p-card-pad text-left">
              <Users className="text-safe" /> <span className="text-heading">Community Hub</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <Shield size={16} /> DEEP FEATURES — LAYER 3
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => navigate('/recovery')} className="service-card flex min-h-touch items-center gap-3 p-card-pad text-left">
              <Clock className="text-blue-400" /> <span className="text-heading">Recovery Timeline</span>
              <span className="ml-auto text-[10px] text-smoke-400">PTSD • Telehealth</span>
            </button>
            <button onClick={() => navigate('/training')} className="service-card flex min-h-touch items-center gap-3 p-card-pad text-left">
              <GraduationCap className="text-warning" /> <span className="text-heading">Training Academy</span>
              <span className="ml-auto text-[10px] text-smoke-400">Drills • CPR</span>
            </button>
            <button onClick={() => navigate('/trip-risk')} className="service-card flex min-h-touch items-center gap-3 p-card-pad text-left">
              <MapPin className="text-safe" /> <span className="text-heading">Pre-Trip Risk</span>
              <span className="ml-auto text-[10px] text-smoke-400">Weather • AQI</span>
            </button>
            <button onClick={() => navigate('/blood-bank')} className="service-card flex min-h-touch items-center gap-3 p-card-pad text-left">
              <Droplets className="text-emergency" /> <span className="text-heading">Blood Bank</span>
              <span className="ml-auto text-[10px] text-smoke-400">Donor • Inventory</span>
            </button>
            <button onClick={() => navigate('/vehicle')} className="service-card flex min-h-touch items-center gap-3 p-card-pad text-left">
              <Car className="text-blue-400" /> <span className="text-heading">Vehicle Dashboard</span>
              <span className="ml-auto text-[10px] text-smoke-400">OBD-II • Blackbox</span>
            </button>
          </div>
        </section>

        {/* System Info */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <Database size={16} /> SYSTEM INFO
          </h2>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--color-text-muted)]">Offline Cache</span>
              <span className="font-mono">{cacheSize}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--color-text-muted)]">Screens</span>
              <span className="font-mono">15 screens</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--color-text-muted)]">Features</span>
              <span className="font-mono">120+ features</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--color-text-muted)]">Version</span>
              <span className="font-mono">3.0.0-layer3</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
