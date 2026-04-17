import { useEffect, useMemo, useRef, useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import Panel from '../../components/Panel'

// ─── Zone Risk Map Types & Data ──────────────────────────────────────────────

const INITIAL_ZONES = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    risk: 'high',
    triggerCount: 42,
    weatherStatus: 'Heavy Rain',
    aqiLevel: 'Unhealthy (168)',
    curfewStrike: 'Port Strike Active',
    affectedWorkers: 1240,
    estimatedPayoutInr: 4960000,
  },
  {
    id: 'delhi',
    name: 'Delhi',
    risk: 'medium',
    triggerCount: 27,
    weatherStatus: 'Haze',
    aqiLevel: 'Very Unhealthy (215)',
    curfewStrike: 'None',
    affectedWorkers: 870,
    estimatedPayoutInr: 3480000,
  },
  {
    id: 'bangalore',
    name: 'Bangalore',
    risk: 'low',
    triggerCount: 8,
    weatherStatus: 'Partly Cloudy',
    aqiLevel: 'Good (42)',
    curfewStrike: 'None',
    affectedWorkers: 210,
    estimatedPayoutInr: 840000,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    risk: 'medium',
    triggerCount: 19,
    weatherStatus: 'Thunderstorms',
    aqiLevel: 'Moderate (95)',
    curfewStrike: 'None',
    affectedWorkers: 560,
    estimatedPayoutInr: 2240000,
  },
  {
    id: 'pune',
    name: 'Pune',
    risk: 'low',
    triggerCount: 5,
    weatherStatus: 'Clear',
    aqiLevel: 'Good (38)',
    curfewStrike: 'None',
    affectedWorkers: 130,
    estimatedPayoutInr: 520000,
  },
  {
    id: 'chennai',
    name: 'Chennai',
    risk: 'high',
    triggerCount: 38,
    weatherStatus: 'Cyclone Watch',
    aqiLevel: 'Unhealthy (155)',
    curfewStrike: 'Section 144 Active',
    affectedWorkers: 1080,
    estimatedPayoutInr: 4320000,
  },
  {
    id: 'vijayawada',
    name: 'Vijayawada',
    risk: 'high',
    triggerCount: 31,
    weatherStatus: 'Flood Warning',
    aqiLevel: 'Unhealthy (142)',
    curfewStrike: 'Transport Strike',
    affectedWorkers: 920,
    estimatedPayoutInr: 3680000,
  },
  {
    id: 'indore',
    name: 'Indore',
    risk: 'low',
    triggerCount: 4,
    weatherStatus: 'Clear',
    aqiLevel: 'Moderate (88)',
    curfewStrike: 'None',
    affectedWorkers: 90,
    estimatedPayoutInr: 360000,
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    risk: 'medium',
    triggerCount: 16,
    weatherStatus: 'Dust Storm',
    aqiLevel: 'Unhealthy (162)',
    curfewStrike: 'None',
    affectedWorkers: 430,
    estimatedPayoutInr: 1720000,
  },
]

const RISK_LEVELS = ['low', 'medium', 'high']

function randomRisk() {
  return RISK_LEVELS[Math.floor(Math.random() * RISK_LEVELS.length)]
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function riskLabelFromProbability(p) {
  if (p >= 85) return 'critical'
  if (p >= 65) return 'high'
  if (p >= 40) return 'medium'
  return 'low'
}

function basePredictiveRows(multiplier) {
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D']
  return zones.map((zone, idx) => {
    const weather_risk = clamp(22 + idx * 14 + randInt(-6, 10), 0, 100)
    const AQI_risk = clamp(18 + idx * 16 + randInt(-8, 12), 0, 100)
    const disruption_probability = clamp(Math.round((weather_risk * 0.45 + AQI_risk * 0.35 + randInt(8, 28)) * multiplier), 0, 100)
    const risk_label = riskLabelFromProbability(disruption_probability)
    const estimated_claims = clamp(Math.round((12 + idx * 18 + randInt(-4, 8)) * multiplier), 0, 999)
    const expected_payout_exposure_inr = Math.round(estimated_claims * (480 + idx * 90))
    return {
      zone,
      weather_risk,
      AQI_risk,
      disruption_probability,
      risk_label,
      estimated_claims,
      expected_payout_exposure_inr,
      disruption: disruption_probability >= 65 ? 'YES' : 'NO',
    }
  })
}

function makeTrendPoint(rows) {
  const pickZone = (z) => rows.find((r) => r.zone === z)?.disruption_probability ?? 0
  return {
    t: Date.now(),
    ZoneA: pickZone('Zone A'),
    ZoneB: pickZone('Zone B'),
    ZoneC: pickZone('Zone C'),
    ZoneD: pickZone('Zone D'),
  }
}

function ZoneRiskMap({ simulationRunCount }) {
  const [zones, setZones] = useState(INITIAL_ZONES)
  const [selectedZone, setSelectedZone] = useState(null)

  useEffect(() => {
    if (simulationRunCount === 0) return
    setZones((prev) =>
      prev.map((z) => ({
        ...z,
        risk: randomRisk(),
        triggerCount: z.triggerCount + Math.floor(Math.random() * 8),
      }))
    )
  }, [simulationRunCount])

  const riskColor = (risk) => {
    if (risk === 'high') return '#FF4D4D'
    if (risk === 'medium') return '#FFB020'
    return '#34D399'
  }

  const riskBg = (risk) => {
    if (risk === 'high') return 'bg-[#FFF5F5] border-[#FFCDD2]'
    if (risk === 'medium') return 'bg-[#FFFBF0] border-[#FFE5A0]'
    return 'bg-[#F0FFF8] border-[#B2F0D8]'
  }

  const riskLabel = (risk) => risk.toUpperCase() + ' RISK'

  return (
    <>
      <Panel
        title="ZONE RISK MAP"
        subtitle="click a zone to view details"
        className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
        headerClassName="border-b border-[#E5E5E5]"
        bodyClassName="p-4"
      >
        <div className="grid grid-cols-3 gap-3">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`rounded-xl border p-3 text-left transition-all duration-150 hover:shadow-md active:scale-[0.98] cursor-pointer ${riskBg(zone.risk)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: riskColor(zone.risk) }} />
                <span className="text-[13px] font-semibold text-[#111111] truncate">{zone.name}</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider mb-1" style={{ color: riskColor(zone.risk) }}>
                {riskLabel(zone.risk)}
              </div>
              <div className="text-[11px] text-[#666666]">{zone.triggerCount} triggers today</div>
            </button>
          ))}
        </div>
      </Panel>

      <AnimatePresence>
        {selectedZone && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSelectedZone(null)}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[440px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden"
            >
              <div
                className="px-6 pt-5 pb-4"
                style={{
                  backgroundColor:
                    selectedZone.risk === 'high' ? '#FFF5F5' : selectedZone.risk === 'medium' ? '#FFFBF0' : '#F0FFF8',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-[20px] font-semibold text-[#111111]">{selectedZone.name}</h2>
                    <div
                      className="mt-0.5 text-[11px] font-semibold tracking-wider"
                      style={{
                        color:
                          selectedZone.risk === 'high' ? '#FF4D4D' : selectedZone.risk === 'medium' ? '#FFB020' : '#34D399',
                      }}
                    >
                      {selectedZone.risk.toUpperCase()} RISK ZONE
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="text-[#999999] hover:text-[#333333] text-[18px] leading-none mt-0.5 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-3">
                {[
                  { label: 'Trigger Count Today', value: `${selectedZone.triggerCount} events` },
                  { label: 'Weather Status', value: selectedZone.weatherStatus },
                  { label: 'AQI Level', value: selectedZone.aqiLevel },
                  { label: 'Curfew / Strike', value: selectedZone.curfewStrike },
                  { label: 'Affected Workers', value: selectedZone.affectedWorkers.toLocaleString('en-IN') },
                  { label: 'Est. Payout Impact', value: `₹ ${selectedZone.estimatedPayoutInr.toLocaleString('en-IN')}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-[#F0F0F0] pb-3 last:border-b-0 last:pb-0">
                    <span className="text-[13px] text-[#666666]">{label}</span>
                    <span className="text-[13px] font-medium text-[#111111] tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function toneStyles(t) {
  if (t === 'red') return { dot: 'bg-[#FF4D4D]', text: 'text-[#111111]', border: 'border-[#FF4D4D]', bg: 'bg-[#FFFFFF]' }
  if (t === 'yellow') return { dot: 'bg-[#FFB020]', text: 'text-[#111111]', border: 'border-[#FFB020]', bg: 'bg-[#FFFFFF]' }
  return { dot: 'bg-[#34D399]', text: 'text-[#111111]', border: 'border-[#E5E5E5]', bg: 'bg-[#FFFFFF]' }
}

function AgentCard({ title, status }) {
  const s = toneStyles(status.tone)

  return (
    <div className={`rounded-2xl border ${s.border} ${s.bg} px-4 py-4`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-[#111111]">{title}</div>
          <div className={`mt-1 text-[11px] ${s.text}`}>{status.label}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          <span className="text-[10px] tracking-wider text-[#666666]">{status.tone.toUpperCase()}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        {status.meta.map((m) => (
          <div key={m.k} className="contents">
            <div className="text-[#666666] truncate">{m.k}</div>
            <div className="text-[#111111] tabular-nums truncate">{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentStatusPanel({ monitor, trigger, fraud, payout }) {
  return (
    <Panel
      title="AGENT GRID"
      subtitle="Monitor → Trigger → Fraud → Payout"
      className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
      headerClassName="border-b border-[#E5E5E5]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AgentCard title="Monitor Agent" status={monitor} />
        <AgentCard title="Trigger Agent" status={trigger} />
        <AgentCard title="Fraud Agent" status={fraud} />
        <AgentCard title="Payout Agent" status={payout} />
      </div>
    </Panel>
  )
}

function riskPill(level) {
  if (level === 'high') return 'bg-[#111111] border-[#111111] text-[#FFFFFF]'
  if (level === 'med') return 'bg-[#F2F2F2] border-[#E5E5E5] text-[#111111]'
  return 'bg-[#FFFFFF] border-[#E5E5E5] text-[#111111]'
}

function TierControlPanel({ tiers, activeTier, onSelectTier, onSetMultiplier }) {
  const t = tiers[activeTier]

  const detail = useMemo(() => {
    return {
      cities: (t?.cities ?? []).slice(0, 12),
      risk: t?.risk,
    }
  }, [t])

  return (
    <Panel
      title="TIER CONTROL"
      subtitle="City multipliers + risk"
      className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
      headerClassName="border-b border-[#E5E5E5]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {tiers.map((row, idx) => {
            const active = idx === activeTier
            return (
              <button
                key={row.name}
                type="button"
                onClick={() => onSelectTier(idx)}
                className={
                  'w-full text-left rounded-xl border px-4 py-3 transition duration-200 ' +
                  (active ? 'border-[#111111] bg-[#F7F7F7]' : 'border-[#E5E5E5] bg-[#FFFFFF] hover:bg-[#F7F7F7]')
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[12px] font-semibold text-[#111111]">{row.name}</div>
                    <div className="mt-1 text-[11px] text-[#666666] truncate">{row.cities.join(', ')}</div>
                  </div>
                  <div className="text-[12px] text-[#111111] tabular-nums">{row.multiplier.toFixed(2)}x</div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] p-4 min-h-[220px]">
          <div className="text-[10px] uppercase tracking-wider text-[#666666]">Selected tier</div>
          <div className="mt-1 text-[12px] font-semibold text-[#111111]">{t?.name ?? '—'}</div>

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-[#666666]">Multiplier</div>
              <div className="text-[11px] text-[#111111] tabular-nums">{(t?.multiplier ?? 1).toFixed(2)}x</div>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.01}
              value={t?.multiplier ?? 1}
              onChange={(e) => onSetMultiplier(activeTier, Number(e.target.value))}
              className="mt-2 w-full accent-[#111111]"
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className={`rounded-lg border px-2 py-2 ${riskPill(detail.risk?.weather ?? 'low')}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-80">Weather</div>
              <div className="mt-1 text-[11px] font-semibold">{(detail.risk?.weather ?? 'low').toUpperCase()}</div>
            </div>
            <div className={`rounded-lg border px-2 py-2 ${riskPill(detail.risk?.AQI ?? 'low')}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-80">AQI</div>
              <div className="mt-1 text-[11px] font-semibold">{(detail.risk?.AQI ?? 'low').toUpperCase()}</div>
            </div>
            <div className={`rounded-lg border px-2 py-2 ${riskPill(detail.risk?.social ?? 'low')}`}>
              <div className="text-[10px] uppercase tracking-wider opacity-80">Social</div>
              <div className="mt-1 text-[11px] font-semibold">{(detail.risk?.social ?? 'low').toUpperCase()}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wider text-[#666666]">Cities</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {detail.cities.length === 0 ? (
                <div className="text-[11px] text-[#666666]">—</div>
              ) : (
                detail.cities.map((c) => (
                  <span key={c} className="rounded-full border border-[#E5E5E5] bg-[#FFFFFF] px-2 py-1 text-[11px] text-[#111111]">
                    {c}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function pickTone(value, warn, crit) {
  if (value >= crit) return 'red'
  if (value >= warn) return 'yellow'
  return 'green'
}

function buildAgentStatus(seed) {
  const monitorTone = pickTone(seed.monitor.zones, 8, 12)
  const triggerTone = pickTone(seed.trigger.triggers_today, 20, 40)
  const fraudTone = pickTone(seed.fraud.holds_active, 8, 14)
  const payoutTone = pickTone(seed.payout.failures, 3, 7)

  return {
    monitor: {
      tone: monitorTone,
      label: 'Monitoring active',
      meta: [
        { k: 'last_poll_time', v: seed.monitor.last_poll_time },
        { k: 'zones_tracked', v: String(seed.monitor.zones) },
      ],
    },
    trigger: {
      tone: triggerTone,
      label: 'Trigger sweep running',
      meta: [
        { k: 'triggers_today', v: String(seed.trigger.triggers_today) },
        { k: 'pipeline_latency', v: seed.trigger.pipeline_latency },
      ],
    },
    fraud: {
      tone: fraudTone,
      label: 'Fraud scoring',
      meta: [
        { k: 'claims_processed', v: String(seed.fraud.claims_processed) },
        { k: 'holds_active', v: String(seed.fraud.holds_active) },
      ],
    },
    payout: {
      tone: payoutTone,
      label: 'Payout settlement',
      meta: [
        { k: 'payouts_processed', v: String(seed.payout.payouts_processed) },
        { k: 'failures', v: String(seed.payout.failures) },
      ],
    },
  }
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function nowIso() {
  const d = new Date()
  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` +
    `T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}Z`
  )
}

function makeEvent() {
  const workerN = 100 + Math.floor(Math.random() * 900)
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D']
  const types = ['rainfall', 'heat', 'AQI', 'curfew']
  const severities = ['L1', 'L2', 'L3']

  const zone = zones[Math.floor(Math.random() * zones.length)]
  const trigger_type = types[Math.floor(Math.random() * types.length)]
  const severity = severities[Math.floor(Math.random() * severities.length)]

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `SIM-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`

  return {
    id,
    worker_id: `W${workerN}`,
    zone,
    trigger_type,
    severity,
    timestamp: nowIso(),
    payout_status: 'pending',
  }
}

function statusLabel(s) {
  if (s === 'running') return 'Running'
  if (s === 'stopped') return 'Stopped'
  return 'Idle'
}

function SimulationPanel({ status, eventsCount, onStart, onStop, onClear }) {
  const running = status === 'running'

  const headerRight = useMemo(() => {
    return <div className="text-[10px] uppercase tracking-wider text-[#666666]">{statusLabel(status)}</div>
  }, [status])

  return (
    <Panel
      title="SIMULATION ENGINE"
      subtitle="Run Simulation → generates events every 2s"
      className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
      headerClassName="border-b border-[#E5E5E5]"
      right={headerRight}
    >
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
        animate={
          running
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(255,255,255,0)',
                  '0 0 26px 2px rgba(255,255,255,0.22)',
                  '0 0 0 0 rgba(255,255,255,0)',
                ],
              }
            : {
                boxShadow: '0 0 0 0 rgba(0,0,0,0)',
              }
        }
        onClick={onStart}
        disabled={running}
        className={
          'w-full rounded-2xl border px-5 py-5 text-[14px] font-semibold tracking-wide transition duration-200 ' +
          (running
            ? 'border-[#111111] bg-[#111111] text-[#FFFFFF] cursor-not-allowed'
            : 'border-[#E5E5E5] bg-[#FFFFFF] text-[#111111] hover:bg-[#F7F7F7]')
        }
      >
        Run Simulation
      </motion.button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onStop}
          disabled={!running}
          className={
            'rounded-xl border px-3 py-2 text-[12px] font-semibold transition ' +
            (running
              ? 'border-[#E5E5E5] bg-[#FFFFFF] text-[#111111] hover:bg-[#F7F7F7]'
              : 'border-[#E5E5E5] bg-[#FFFFFF] text-[#999999] cursor-not-allowed')
          }
        >
          Stop Simulation
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] px-3 py-2 text-[12px] font-semibold text-[#111111] transition hover:bg-[#F7F7F7]"
        >
          Clear Feed
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-3">
        <div className="text-[10px] uppercase tracking-wider text-[#666666]">Stream status</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <div className="text-[#666666]">Interval</div>
          <div className="text-[#111111]">2s</div>
          <div className="text-[#666666]">Buffered events</div>
          <div className="text-[#111111] tabular-nums">{eventsCount}</div>
        </div>
      </div>
    </Panel>
  )
}

export default function CommandCenter() {
  const [simulationStatus, setSimulationStatus] = useState('idle')
  const [events, setEvents] = useState([])
  const lifecycleTimersRef = useRef(new Map())
  const timerRef = useRef(null)

  const [tiers, setTiers] = useState([
    {
      name: 'Tier 1 (1.2x)',
      multiplier: 1.2,
      cities: ['Mumbai', 'Delhi', 'Bangalore'],
      risk: { weather: 'med', AQI: 'high', social: 'low' },
    },
    {
      name: 'Tier 2 (1.0x)',
      multiplier: 1.0,
      cities: ['Hyderabad', 'Pune', 'Chennai'],
      risk: { weather: 'low', AQI: 'med', social: 'low' },
    },
    {
      name: 'Tier 3 (0.85x)',
      multiplier: 0.85,
      cities: ['Vijayawada', 'Indore', 'Jaipur'],
      risk: { weather: 'high', AQI: 'low', social: 'med' },
    },
  ])
  const [activeTier, setActiveTier] = useState(0)

  const [predictive, setPredictive] = useState(() => {
    const rows = basePredictiveRows(1)
    return {
      zones: rows,
      trend: [makeTrendPoint(rows)],
    }
  })

  const [agentStats, setAgentStats] = useState(() => ({
    monitor: { zones_tracked: 9, last_poll_time: '00:00:00' },
    trigger: { triggers_today: 18, pipeline_latency: '180ms' },
    fraud: { holds_active: 6, claims_processed: 420 },
    payout: { failures: 1, payouts_processed: 286 },
  }))

  useEffect(() => {
    const t = window.setInterval(() => {
      const d = new Date()
      const hh = pad2(d.getHours())
      const mm = pad2(d.getMinutes())
      const ss = pad2(d.getSeconds())
      setAgentStats((prev) => ({
        monitor: { ...prev.monitor, last_poll_time: `${hh}:${mm}:${ss}`, zones_tracked: Math.max(1, prev.monitor.zones_tracked + randInt(-1, 1)) },
        trigger: { ...prev.trigger, triggers_today: Math.max(0, prev.trigger.triggers_today + randInt(-2, 4)), pipeline_latency: `${Math.max(80, 140 + randInt(-40, 90))}ms` },
        fraud: { ...prev.fraud, holds_active: Math.max(0, prev.fraud.holds_active + randInt(-1, 2)), claims_processed: Math.max(0, prev.fraud.claims_processed + randInt(4, 18)) },
        payout: { ...prev.payout, failures: Math.max(0, prev.payout.failures + (Math.random() < 0.2 ? 1 : 0)), payouts_processed: Math.max(0, prev.payout.payouts_processed + randInt(2, 14)) },
      }))
    }, 10000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const tick = () => {
      const mult = tiers[activeTier]?.multiplier ?? 1
      setPredictive((prev) => {
        const nextRows = basePredictiveRows(mult)
        const nextPoint = makeTrendPoint(nextRows)
        return {
          zones: nextRows,
          trend: [...(prev.trend ?? []).slice(-11), nextPoint],
        }
      })
    }

    tick()
    const t = window.setInterval(tick, 10000)
    return () => window.clearInterval(t)
  }, [activeTier, tiers])

  useEffect(() => {
    if (simulationStatus !== 'running') {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
      return
    }

    timerRef.current = window.setInterval(() => {
      const next = makeEvent()
      setEvents((prev) => [next, ...prev].slice(0, 60))

      const toProcessing = window.setTimeout(() => {
        setEvents((prev) => prev.map((e) => (e.id === next.id ? { ...e, payout_status: 'processing' } : e)))
      }, 2000)

      const toTerminal = window.setTimeout(() => {
        const heldChance = randInt(20, 30) / 100
        setEvents((prev) =>
          prev.map((e) => (e.id === next.id ? { ...e, payout_status: Math.random() < heldChance ? 'held' : 'completed' } : e))
        )
      }, 5000)

      lifecycleTimersRef.current.set(next.id, [toProcessing, toTerminal])
    }, 2000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [simulationStatus])

  useEffect(() => {
    return () => {
      for (const timers of Array.from(lifecycleTimersRef.current.values())) {
        for (const t of timers) window.clearTimeout(t)
      }
      lifecycleTimersRef.current.clear()
    }
  }, [])

  const simulationRunCount = useMemo(() => {
    return events.length > 0 ? Math.ceil(events.length / 5) : 0
  }, [events.length])

  const agentStatus = useMemo(() => {
    return buildAgentStatus({
      monitor: { zones: agentStats.monitor.zones_tracked, last_poll_time: agentStats.monitor.last_poll_time },
      trigger: { triggers_today: agentStats.trigger.triggers_today, pipeline_latency: agentStats.trigger.pipeline_latency },
      fraud: { holds_active: agentStats.fraud.holds_active, claims_processed: agentStats.fraud.claims_processed },
      payout: { failures: agentStats.payout.failures, payouts_processed: agentStats.payout.payouts_processed },
    })
  }, [agentStats])

  const riskRowClass = (label) => {
    if (label === 'critical') return 'text-[#FF4D4D]'
    if (label === 'high') return 'text-[#FFB020]'
    if (label === 'medium') return 'text-[#3A3A3A]'
    return 'text-[#111111]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 text-[#111111]"
    >
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-[#111111]">Bhima Control</h1>
        <div className="mt-1 text-[12px] text-[#3A3A3A]">SIMULATION + LIVE TRIGGER</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimulationPanel
          status={simulationStatus}
          eventsCount={events.length}
          onStart={() => setSimulationStatus('running')}
          onStop={() => setSimulationStatus('stopped')}
          onClear={() => {
            for (const timers of Array.from(lifecycleTimersRef.current.values())) {
              for (const t of timers) window.clearTimeout(t)
            }
            lifecycleTimersRef.current.clear()
            setEvents([])
            setSimulationStatus('idle')
          }}
        />
        <ZoneRiskMap simulationRunCount={simulationRunCount} />
      </div>

      <AgentStatusPanel
        monitor={agentStatus.monitor}
        trigger={agentStatus.trigger}
        fraud={agentStatus.fraud}
        payout={agentStatus.payout}
      />

      <TierControlPanel
        tiers={tiers}
        activeTier={activeTier}
        onSelectTier={setActiveTier}
        onSetMultiplier={(idx, value) => setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, multiplier: value } : t)))}
      />

      <Panel
        title="PREDICTIVE ANALYTICS"
        subtitle="zone risk · claims projection · payout exposure"
        className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
        headerClassName="border-b border-[#E5E5E5]"
        bodyClassName="px-0 py-0"
      >
        <div className="px-5 pt-4 pb-3 border-b border-[#E5E5E5]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-3">
              <div className="text-[10px] uppercase tracking-wider text-[#666666]">Estimated claims count</div>
              <div className="mt-1 text-[16px] font-semibold tabular-nums text-[#111111]">
                {predictive.zones.reduce((a, z) => a + (z.estimated_claims ?? 0), 0)}
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-3">
              <div className="text-[10px] uppercase tracking-wider text-[#666666]">Expected payout exposure (₹)</div>
              <div className="mt-1 text-[16px] font-semibold tabular-nums text-[#111111]">
                {predictive.zones
                  .reduce((a, z) => a + (z.expected_payout_exposure_inr ?? 0), 0)
                  .toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#666666]">
                {['Zone', 'Weather', 'AQI', 'Disruption', 'Label', 'Claims', 'Exposure (₹)'].map((h) => (
                  <th key={h} className="px-5 py-3 border-b border-[#E5E5E5]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictive.zones.map((z) => (
                <tr key={z.zone} className="border-b border-[#E5E5E5] last:border-b-0 h-[44px]">
                  <td className="px-5 py-3 text-[#111111] truncate">{z.zone}</td>
                  <td className="px-5 py-3 text-[#3A3A3A] tabular-nums">{z.weather_risk}%</td>
                  <td className="px-5 py-3 text-[#3A3A3A] tabular-nums">{z.AQI_risk}%</td>
                  <td
                    className={
                      'px-5 py-3 tabular-nums ' +
                      (z.disruption_probability >= 85
                        ? 'text-[#FF4D4D] font-semibold'
                        : z.disruption_probability >= 65
                          ? 'text-[#FFB020]'
                          : 'text-[#3A3A3A]')
                    }
                  >
                    {z.disruption_probability}%
                  </td>
                  <td className={`px-5 py-3 uppercase tracking-wider text-[10px] ${riskRowClass(z.risk_label)}`}>{z.risk_label}</td>
                  <td className="px-5 py-3 text-[#111111] tabular-nums">{z.estimated_claims}</td>
                  <td className="px-5 py-3 text-[#111111] tabular-nums">{z.expected_payout_exposure_inr.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-[#E5E5E5]">
          <div className="text-[10px] uppercase tracking-wider text-[#666666]">Risk trend (last ~2 min)</div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {['ZoneA', 'ZoneB', 'ZoneC', 'ZoneD'].map((k) => {
              const arr = (predictive.trend ?? []).map((p) => p[k])
              const last = arr.length ? arr[arr.length - 1] : 0
              const w = Math.max(0, Math.min(100, last))
              return (
                <div key={k} className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-[#3A3A3A]">{k.replace('Zone', 'Zone ')}</div>
                    <div className="text-[11px] tabular-nums text-[#111111]">{last}%</div>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#E5E5E5] overflow-hidden">
                    <div
                      className={
                        'h-full ' +
                        (last >= 85
                          ? 'bg-[#FF4D4D]'
                          : last >= 65
                            ? 'bg-[#FFB020]'
                            : last >= 40
                              ? 'bg-[#4DA3FF]'
                              : 'bg-[#34D399]')
                      }
                      style={{ width: `${w}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Panel>
    </motion.div>
  )
}
