import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Target, Award, Zap, Check, X, ChevronRight, Timer } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { getDailyDrill, completeDrill, evaluateCprTaps, recordCprScore, getTrainingBadges, getTrainingStats, getAllDrills, getDrillCategories } from '../utils/trainingAcademy'

export default function TrainingAcademy() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('drill')
  const [drill, setDrill] = useState(() => getDailyDrill())
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [cprActive, setCprActive] = useState(false)
  const [cprTaps, setCprTaps] = useState([])
  const [cprResult, setCprResult] = useState(null)
  const [cprTimer, setCprTimer] = useState(30)
  const cprTimerRef = useRef(null)
  const stats = getTrainingStats()
  const badges = getTrainingBadges()

  const handleAnswer = (idx) => {
    if (answered) return
    setSelectedAnswer(idx)
    setAnswered(true)
    const correct = idx === drill.drill.correct
    completeDrill(drill.drill.id, correct)
  }

  const nextDrill = () => {
    setDrill(getDailyDrill())
    setSelectedAnswer(null)
    setAnswered(false)
  }

  const startCpr = useCallback(() => {
    setCprActive(true)
    setCprTaps([])
    setCprResult(null)
    setCprTimer(30)
    cprTimerRef.current = setInterval(() => {
      setCprTimer(prev => {
        if (prev <= 1) {
          clearInterval(cprTimerRef.current)
          setCprActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleCprTap = () => {
    if (!cprActive) return
    setCprTaps(prev => [...prev, Date.now()])
    if (navigator.vibrate) navigator.vibrate(15)
  }

  // Evaluate when CPR stops
  if (!cprActive && cprTaps.length > 5 && !cprResult) {
    const result = evaluateCprTaps(cprTaps)
    setCprResult(result)
    recordCprScore(result)
  }

  const tabs = [
    { id: 'drill', label: 'Daily Drill', icon: <Zap size={14} /> },
    { id: 'cpr', label: 'CPR Test', icon: <Target size={14} /> },
    { id: 'badges', label: 'Badges', icon: <Award size={14} /> },
  ]

  return (
    <div className="flex h-screen flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      <header className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full"><ArrowLeft /></button>
          <h1 className="text-display-md">Training</h1>
        </div>
        <div className="mt-3 flex gap-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12px] font-medium uppercase tracking-wider transition-all ${activeTab === t.id ? 'bg-emergency text-white' : 'bg-asphalt-500 text-smoke-300'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-gutter py-5 pb-32">
        {activeTab === 'drill' && (
          <div className="space-y-4 slide-up">
            {/* Streak banner */}
            <section className="rounded-card border border-warning/25 bg-warning-muted p-card-pad">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-label text-warning">🔥 {stats.streak}-Day Streak</div>
                  <p className="text-caption mt-1">{stats.streak >= 7 ? 'Basic Trained unlocked!' : `${7 - stats.streak} days to Basic Trained badge`}</p>
                </div>
                <div className="text-3xl font-bold text-warning">{stats.streak}</div>
              </div>
            </section>

            {drill.drill ? (
              <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-pill bg-asphalt-400 px-2 py-0.5 text-[10px] text-smoke-300">{drill.drill.category}</span>
                </div>
                <h2 className="text-heading mt-2 mb-4">{drill.drill.question}</h2>
                <div className="space-y-2">
                  {drill.drill.options.map((opt, i) => {
                    let styles = 'border-smoke-500/20 bg-asphalt-500 text-smoke-200'
                    if (answered && i === drill.drill.correct) styles = 'border-safe bg-safe/15 text-safe'
                    else if (answered && i === selectedAnswer && i !== drill.drill.correct) styles = 'border-emergency bg-emergency/15 text-emergency'
                    return (
                      <button key={i} onClick={() => handleAnswer(i)}
                        className={`w-full rounded-card border p-3 text-left text-[13px] transition-all ${styles}`}>
                        <span className="mr-2 font-bold">{String.fromCharCode(65 + i)}.</span>{opt}
                        {answered && i === drill.drill.correct && <Check size={16} className="float-right text-safe" />}
                        {answered && i === selectedAnswer && i !== drill.drill.correct && <X size={16} className="float-right text-emergency" />}
                      </button>
                    )
                  })}
                </div>
                {answered && (
                  <div className="mt-4 rounded-sharp border border-smoke-500/15 bg-asphalt-600 p-3">
                    <div className="text-[12px] font-medium text-warning mb-1">Explanation</div>
                    <p className="text-[12px] text-smoke-300">{drill.drill.explanation}</p>
                  </div>
                )}
                {answered && <button onClick={nextDrill} className="btn-primary mt-4 w-full gap-2"><ChevronRight size={16} />Next Question</button>}
              </section>
            ) : (
              <section className="rounded-card border border-safe/25 bg-safe-muted p-card-pad text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-heading">Today's drill completed!</div>
                <p className="text-caption mt-1">Come back tomorrow for your next question.</p>
              </section>
            )}

            {/* All Categories */}
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="text-label text-smoke-300 mb-2">Training Categories</div>
              <div className="flex flex-wrap gap-1.5">
                {getDrillCategories().map(cat => (
                  <span key={cat} className="rounded-pill bg-asphalt-400 px-3 py-1 text-[11px] text-smoke-300">{cat}</span>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'cpr' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-emergency/25 bg-emergency-muted p-card-pad text-center">
              <div className="text-label text-emergency">CPR Timing Tester</div>
              <p className="mt-1 text-caption">Tap the button for 30 seconds to simulate compressions. Target: 100-120 BPM.</p>
            </section>

            {!cprActive && !cprResult && (
              <button onClick={startCpr} className="btn-primary w-full py-6 text-lg gap-2"><Target size={20} />Start 30s CPR Test</button>
            )}

            {cprActive && (
              <div className="flex flex-col items-center">
                <div className="mb-4 text-6xl font-mono font-bold text-emergency">{cprTimer}s</div>
                <button onPointerDown={handleCprTap}
                  className="flex h-40 w-40 items-center justify-center rounded-full bg-emergency text-white text-xl font-bold shadow-glow-red-strong active:scale-90 transition-transform select-none">
                  TAP<br/>{cprTaps.length}
                </button>
                <p className="mt-3 text-caption">Tap as fast as CPR compressions</p>
              </div>
            )}

            {cprResult && (
              <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                <div className="text-label text-warning mb-3">Results</div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                    <div className={`text-2xl font-bold ${cprResult.rate >= 100 && cprResult.rate <= 120 ? 'text-safe' : 'text-emergency'}`}>{cprResult.rate}</div>
                    <div className="text-[10px] text-smoke-400">BPM</div>
                  </div>
                  <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                    <div className="text-2xl font-bold text-warning">{cprResult.total}</div>
                    <div className="text-[10px] text-smoke-400">Total</div>
                  </div>
                  <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                    <div className={`text-2xl font-bold ${cprResult.passed ? 'text-safe' : 'text-warning'}`}>{cprResult.passed ? '✓' : '✗'}</div>
                    <div className="text-[10px] text-smoke-400">Pass</div>
                  </div>
                </div>
                <div className="rounded-sharp bg-asphalt-600 p-3 text-[13px]">
                  <span className="text-warning font-medium">Feedback: </span>
                  <span className="text-smoke-200">{cprResult.feedback}</span>
                </div>
                <button onClick={() => { setCprResult(null); setCprTaps([]) }} className="btn-ghost mt-3 w-full gap-2"><Target size={14} />Retry</button>
              </section>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="text-label text-warning mb-3">Your Badges</div>
              {badges.length > 0 ? (
                <div className="space-y-2">
                  {badges.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-sharp bg-asphalt-500 p-3">
                      <span className="text-2xl">{b.icon}</span>
                      <div>
                        <div className="text-[14px] font-medium">{b.name}</div>
                        <div className="text-[11px] text-smoke-400">{b.requirement}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-caption text-center py-4">No badges yet. Complete drills and CPR tests to earn badges!</p>
              )}
            </section>
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="text-label text-smoke-300 mb-2">Available Badges</div>
              <div className="space-y-2">
                {[
                  { icon: '🛡️', name: 'Basic Trained', req: '7-day drill streak' },
                  { icon: '⭐', name: 'First Responder Ready', req: '30-day drill streak' },
                  { icon: '❤️', name: 'CPR Certified', req: '3 consecutive CPR passes' },
                  { icon: '🏆', name: 'Scenario Master', req: '10 AI scenarios, 80%+' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-sharp bg-asphalt-600 p-3 opacity-60">
                    <span className="text-xl">{b.icon}</span>
                    <div>
                      <div className="text-[13px] font-medium">{b.name}</div>
                      <div className="text-[10px] text-smoke-400">{b.req}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
