import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Volume2, CheckCircle2, Heart, Droplet, User, Bone } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import StatusBar from '../components/shared/StatusBar'
import firstAidData from '../data/first-aid-content.json'
import { useAppStore } from '../store/useAppStore'

export default function FirstAid() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { language } = useAppStore()
  const reduceMotion = useReducedMotion()
  
  // Fallback to English if translation missing
  const content = firstAidData[language] || firstAidData['en']
  const moduleId = searchParams.get('module')
  const initialGuide = moduleId
    ? content.categories.find((cat) => cat.id === moduleId || `${cat.id}_management` === moduleId)
    : null
  const [selectedGuide, setSelectedGuide] = useState(initialGuide || null)
  const [completedSteps, setCompletedSteps] = useState([])

  const getIcon = (name) => {
    switch(name) {
      case 'heart': return <Heart size={24} />
      case 'droplet': return <Droplet size={24} />
      case 'user': return <User size={24} />
      case 'bone': return <Bone size={24} />
      default: return <Heart size={24} />
    }
  }

  const toggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index))
    } else {
      setCompletedSteps([...completedSteps, index])
    }
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'en' ? 'en-US' : language
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex h-screen w-full flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      
      {/* Header */}
      <div className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => selectedGuide ? setSelectedGuide(null) : navigate('/')} 
            className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full active:bg-asphalt-500"
            aria-label="Go back"
            title="Back"
          >
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
          <h1 className="text-display-md">
            {selectedGuide ? selectedGuide.title : 'First Aid Guide'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="bottom-fade relative z-0 flex-1 overflow-y-auto px-gutter py-6">
        {!selectedGuide ? (
          <>
            <div className="mb-6 rounded-card border border-warning/25 bg-warning-muted p-card-pad">
              <h3 className="text-label mb-1 text-warning">Offline Ready</h3>
              <p className="text-body text-smoke-200">These guides are available without an internet connection.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {content.categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedGuide(cat); setCompletedSteps([]); }}
                  className="slide-up flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-card border border-smoke-500/20 bg-asphalt-700 p-5 shadow-card transition-transform active:scale-95"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                    {getIcon(cat.icon)}
                  </div>
                  <span className="text-heading text-center">{cat.title}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="slide-up flex flex-col gap-4">
            {selectedGuide.steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index)
              return (
                <motion.div 
                  key={index} 
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: isCompleted ? 0.55 : 1, y: 0 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                  className={`flex gap-4 rounded-card border p-card-pad transition-all duration-300 ${isCompleted ? 'border-safe/30 bg-asphalt-500' : 'border-emergency/40 bg-emergency-muted'} border-l-4`}
                >
                  <button
                    onClick={() => toggleStep(index)}
                    className="relative mt-1 flex h-touch w-touch items-center justify-center rounded-card bg-emergency/20"
                    aria-label={isCompleted ? `Mark step ${index + 1} incomplete` : `Mark step ${index + 1} complete`}
                  >
                    <span className="font-display text-[32px] font-extrabold leading-none text-emergency/70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {isCompleted && (
                      <CheckCircle2 size={22} className="absolute -right-1 -top-1 text-safe" aria-hidden="true" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-label text-smoke-300">Step {index + 1}</div>
                        <div className="text-heading text-smoke-100">{step.title || 'Immediate action'}</div>
                      </div>
                      <div className="relative h-12 w-12 shrink-0">
                        <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90" aria-hidden="true">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(240,237,232,0.12)" strokeWidth="4" />
                          <circle cx="24" cy="24" r="20" fill="none" stroke={isCompleted ? '#22C55E' : '#E8361A'} strokeWidth="4" strokeDasharray="126" strokeDashoffset={isCompleted ? '0' : '32'} strokeLinecap="round" />
                        </svg>
                        <span className="text-coords absolute inset-0 flex items-center justify-center text-[11px] text-smoke-100">{step.time}</span>
                      </div>
                    </div>
                    <p className={`text-body ${isCompleted ? 'line-through text-smoke-300' : 'text-smoke-100'}`}>
                      {step.text}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <button onClick={() => speakText(step.text)} className="flex h-touch w-touch items-center justify-center rounded-card bg-asphalt-500 active:scale-95" aria-label="Read step aloud" title="Read aloud">
                        <Volume2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            
            <div className="mt-8 rounded-card border border-emergency/25 bg-emergency-muted p-card-pad text-center">
              <h3 className="text-label mb-2 text-emergency">Do Not Leave Unattended</h3>
              <p className="text-body text-smoke-200">Stay with the person until medical professionals arrive.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
