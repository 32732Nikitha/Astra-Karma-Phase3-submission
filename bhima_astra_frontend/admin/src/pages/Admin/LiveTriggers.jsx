import { useEffect, useMemo, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import Panel from '../../components/Panel'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function fmtTime(ms) {
  const d = new Date(ms)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function parseIsoMs(iso) {
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : Date.now()
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function makeWorkers(triggerId, triggerTsIso) {
  const base = parseIsoMs(triggerTsIso)
  const count = 10 + Math.floor(Math.random() * 11)
  const rows = []

  for (let i = 0; i < count; i++) {
    const wid = `W${100 + Math.floor(Math.random() * 900)}`
    rows.push({
      worker_id: wid,
      created_at: base,
      stage: 'trigger',
      verification_status: 'pending',
      fraud_status: 'clean',
      payout_status: 'pending',
      timeline: { trigger: fmtTime(base) },
    })
  }

  const byId = new Map()
  for (const r of rows) byId.set(`${triggerId}:${r.worker_id}`, r)
  return Array.from(byId.values())
}

function stageAt(elapsedMs) {
  if (elapsedMs < 2000) return 'trigger'
  if (elapsedMs < 4000) return 'verification'
  if (elapsedMs < 6000) return 'fraud'
  return 'payout'
}

function statusColor(payout) {
  if (payout === 'pending') return 'text-[#FFB020]'
  if (payout === 'processing') return 'text-[#4DA3FF]'
  if (payout === 'completed') return 'text-[#34D399]'
  if (payout === 'held') return 'text-[#FF4D4D]'
  return 'text-[#E5E5E5]'
}

function StageDot({ active, color }) {
  return <span className={'h-2 w-2 rounded-full ' + (active ? color : 'bg-[#ffffff22]')} />
}

function StageLabel({ active, children }) {
  return (
    <span className={'text-[10px] uppercase tracking-wider ' + (active ? 'text-[#FFFFFF]' : 'text-[#999999]')}>{children}</span>
  )
}

export default function LiveTriggers() {
  const navigate = useNavigate()

  const ev = useMemo(() => {
    return {
      id: 'TRG-001',
      timestamp: new Date().toISOString(),
      zone: 'Zone A',
      trigger_type: 'rainfall',
      severity: 'L2',
    }
  }, [])

  const [workers, setWorkers] = useState([])
  const startRef = useRef(Date.now())
  const fraudMapRef = useRef(new Map())

  useEffect(() => {
    startRef.current = parseIsoMs(ev.timestamp)
    fraudMapRef.current = new Map()
    setWorkers(makeWorkers(ev.id, ev.timestamp))
  }, [ev])

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const elapsed = now - startRef.current
      const st = stageAt(elapsed)

      setWorkers((prev) =>
        prev.map((w) => {
          const key = `${ev.id}:${w.worker_id}`
          const suspicious = fraudMapRef.current.get(key)
          const shouldBeSuspicious = suspicious ?? Math.random() < (0.2 + Math.random() * 0.1)

          if (suspicious === undefined && st === 'fraud') {
            fraudMapRef.current.set(key, shouldBeSuspicious)
          }

          const nextStage = st
          const next = { ...w, stage: nextStage }

          if (nextStage === 'verification') {
            next.verification_status = 'pending'
            next.timeline = {
              ...next.timeline,
              verification: next.timeline.verification ?? fmtTime(startRef.current + 2000),
            }
          }

          if (nextStage === 'fraud') {
            next.verification_status = 'verified'
            next.fraud_status = fraudMapRef.current.get(key) ? 'suspicious' : 'clean'
            next.timeline = {
              ...next.timeline,
              verification: next.timeline.verification ?? fmtTime(startRef.current + 2000),
              fraud: next.timeline.fraud ?? fmtTime(startRef.current + 4000),
            }
          }

          if (nextStage === 'payout') {
            const isSuspicious = fraudMapRef.current.get(key) ? true : false
            next.verification_status = 'verified'
            next.fraud_status = isSuspicious ? 'suspicious' : 'clean'
            next.payout_status = isSuspicious ? 'held' : elapsed < 8000 ? 'processing' : 'completed'
            next.timeline = {
              ...next.timeline,
              verification: next.timeline.verification ?? fmtTime(startRef.current + 2000),
              fraud: next.timeline.fraud ?? fmtTime(startRef.current + 4000),
              payout: next.timeline.payout ?? fmtTime(startRef.current + 6000),
            }
          }

          return next
        })
      )
    }

    const iv = window.setInterval(tick, 500)
    return () => window.clearInterval(iv)
  }, [ev])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 text-[#111111]"
    >
      <div>
        <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#111111]">Live Trigger Details</h1>
        <div className="mt-1 text-[12px] text-[#3A3A3A]">Trigger → Verification → Fraud Check → Payout</div>
      </div>

      <Panel
        title="TRIGGER CONTEXT"
        subtitle="selected trigger metadata"
        className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
        headerClassName="border-b border-[#E5E5E5]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#666666]">Trigger</div>
            <div className="mt-1 text-[#111111] truncate">{ev.id}</div>
          </div>
          <div className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#666666]">Timestamp</div>
            <div className="mt-1 text-[#111111] tabular-nums truncate">{ev.timestamp}</div>
          </div>
          <div className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#666666]">Zone</div>
            <div className="mt-1 text-[#111111] truncate">{ev.zone}</div>
          </div>
          <div className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-3">
            <div className="text-[10px] uppercase tracking-wider text-[#666666]">Type / Severity</div>
            <div className="mt-1 text-[#111111] truncate">
              {ev.trigger_type} · {ev.severity}
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="AFFECTED WORKERS"
        subtitle="real-time status per worker"
        className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
        headerClassName="border-b border-[#E5E5E5]"
        bodyClassName="px-0 py-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#666666]">
                {['Worker ID', 'Stage Progress', 'Status', 'Timestamp'].map((h) => (
                  <th key={h} className="px-5 py-3 border-b border-[#E5E5E5]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => {
                const stage = w.stage
                const triggerActive = stage === 'trigger'
                const verificationActive = stage === 'verification'
                const fraudActive = stage === 'fraud'
                const payoutActive = stage === 'payout'

                const currentStatus =
                  payoutActive ? w.payout_status : fraudActive ? w.fraud_status : verificationActive ? w.verification_status : 'triggered'

                const currentStatusClass = payoutActive
                  ? statusColor(w.payout_status)
                  : w.fraud_status === 'suspicious'
                    ? 'text-[#FF4D4D]'
                    : fraudActive
                      ? 'text-[#FFB020]'
                      : verificationActive
                        ? 'text-[#FFB020]'
                        : 'text-[#4DA3FF]'

                const lastTs = w.timeline.payout ?? w.timeline.fraud ?? w.timeline.verification ?? w.timeline.trigger

                const shouldNav = w.payout_status === 'held' || w.fraud_status === 'suspicious'

                return (
                  <tr
                    key={w.worker_id}
                    className="border-b border-[#E5E5E5] last:border-b-0 h-[56px]"
                    role={shouldNav ? 'button' : undefined}
                    tabIndex={shouldNav ? 0 : -1}
                    onClick={() => {
                      if (!shouldNav) return
                      const qp = new URLSearchParams({
                        trigger_id: ev.id,
                        zone: ev.zone,
                        trigger_type: ev.trigger_type,
                        severity: ev.severity,
                        payout_status: w.payout_status,
                      })
                      navigate(`/admin/fraud/${encodeURIComponent(w.worker_id)}?${qp.toString()}`)
                    }}
                  >
                    <td className="px-5 py-3 text-[#111111] truncate">{w.worker_id}</td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <StageDot active={triggerActive} color="bg-[#4DA3FF]" />
                          <StageLabel active={triggerActive}>Trigger</StageLabel>
                        </div>
                        <div className="h-[1px] w-6 bg-[#E5E5E5]" />
                        <div className="flex items-center gap-2">
                          <StageDot active={verificationActive} color="bg-[#FFB020]" />
                          <StageLabel active={verificationActive}>Verify</StageLabel>
                        </div>
                        <div className="h-[1px] w-6 bg-[#E5E5E5]" />
                        <div className="flex items-center gap-2">
                          <StageDot active={fraudActive} color={w.fraud_status === 'suspicious' ? 'bg-[#FF4D4D]' : 'bg-[#FFB020]'} />
                          <StageLabel active={fraudActive}>Fraud</StageLabel>
                        </div>
                        <div className="h-[1px] w-6 bg-[#E5E5E5]" />
                        <div className="flex items-center gap-2">
                          <StageDot
                            active={payoutActive}
                            color={w.payout_status === 'completed' ? 'bg-[#34D399]' : w.payout_status === 'held' ? 'bg-[#FF4D4D]' : 'bg-[#4DA3FF]'}
                          />
                          <StageLabel active={payoutActive}>Payout</StageLabel>
                        </div>
                      </div>

                      <div className="mt-1 grid grid-cols-4 gap-2 text-[10px] text-[#666666]">
                        <div className="truncate">{w.timeline.trigger}</div>
                        <div className="truncate">{w.timeline.verification ?? '—'}</div>
                        <div className="truncate">{w.timeline.fraud ?? '—'}</div>
                        <div className="truncate">{w.timeline.payout ?? '—'}</div>
                      </div>
                    </td>

                    <td className={`px-5 py-3 truncate ${currentStatusClass}`}>{String(currentStatus)}</td>
                    <td className="px-5 py-3 text-[#666666] tabular-nums truncate">{lastTs}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </motion.div>
  )
}
