import { useEffect, useMemo, useState } from 'react'

import { motion } from 'framer-motion'

import Panel from '../../components/Panel'

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function nowIsoMinute() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function statusClass(s) {
  if (s === 'success' || s === 'completed') return 'text-[#34D399]'
  if (s === 'failed') return 'text-[#FF4D4D]'
  if (s === 'processing') return 'text-[#FFB020]'
  return 'text-[#3A3A3A]'
}

function stepBadge(s) {
  if (s === 'completed') return 'bg-[#111111] text-[#FFFFFF] border-[#111111]'
  if (s === 'processing') return 'bg-[#FFFFFF] text-[#111111] border-[#FFB020]'
  if (s === 'failed') return 'bg-[#FFFFFF] text-[#111111] border-[#FF4D4D]'
  return 'bg-[#FFFFFF] text-[#666666] border-[#E5E5E5]'
}

function inr(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export default function PayoutPage() {
  const [flowStatus, setFlowStatus] = useState(() => ({
    stage: 'Trigger',
    steps: [
      { key: 'Trigger', status: 'completed' },
      { key: 'GPS Verification', status: 'processing' },
      { key: 'Fraud Check', status: 'processing' },
      { key: 'UPI Payout', status: 'processing' },
    ],
  }))

  const [payoutHistory, setPayoutHistory] = useState(() => {
    return [
      { worker_id: 'W123', zone: 'Zone A', amount: 500, trigger: 'rainfall', status: 'success', time: '2026-04-16T12:00' },
      { worker_id: 'W452', zone: 'Zone C', amount: 650, trigger: 'AQI', status: 'processing', time: '2026-04-16T12:02' },
      { worker_id: 'W901', zone: 'Zone B', amount: 420, trigger: 'heat', status: 'failed', time: '2026-04-16T12:04' },
    ]
  })

  const [payoutLogs, setPayoutLogs] = useState(() => {
    return [
      { payout_id: 'P-001', worker_id: 'W123', step: 'Fraud Check', timestamp: '12:02', result: 'Passed' },
      { payout_id: 'P-002', worker_id: 'W452', step: 'GPS Verification', timestamp: '12:03', result: 'Processing' },
      { payout_id: 'P-003', worker_id: 'W901', step: 'UPI Payout', timestamp: '12:05', result: 'Failed' },
    ]
  })

  useEffect(() => {
    const stepsOrder = ['Trigger', 'GPS Verification', 'Fraud Check', 'UPI Payout']

    const t = window.setInterval(() => {
      setFlowStatus((prev) => {
        const nextSteps = prev.steps.map((s) => ({ ...s }))

        const processingIdx = nextSteps.findIndex((s) => s.status === 'processing')
        if (processingIdx >= 0 && Math.random() < 0.6) {
          const fail = Math.random() < 0.08
          nextSteps[processingIdx].status = fail ? 'failed' : 'completed'
          if (!fail && processingIdx + 1 < nextSteps.length) nextSteps[processingIdx + 1].status = 'processing'
        }

        const current = nextSteps.find((s) => s.status === 'processing')?.key ?? nextSteps[nextSteps.length - 1].key

        return {
          stage: current,
          steps: nextSteps,
        }
      })

      setPayoutHistory((prev) => {
        const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D']
        const triggers = ['rainfall', 'AQI', 'curfew', 'heat']
        const statuses = ['success', 'failed', 'processing']

        const next = {
          worker_id: `W${randInt(100, 999)}`,
          zone: pick(zones),
          amount: randInt(300, 900),
          trigger: pick(triggers),
          status: pick(statuses),
          time: nowIsoMinute(),
        }

        return [next, ...prev].slice(0, 18)
      })

      setPayoutLogs((prev) => {
        const payout_id = `P-${pad2(randInt(1, 99))}`
        const worker_id = `W${randInt(100, 999)}`
        const step = pick(['GPS Verification', 'Fraud Check', 'UPI Payout'])
        const timestamp = `${pad2(randInt(10, 23))}:${pad2(randInt(0, 59))}`
        const result = pick(['Passed', 'Processing', 'Failed', 'Queued'])

        return [{ payout_id, worker_id, step, timestamp, result }, ...prev].slice(0, 24)
      })
    }, randInt(5000, 10000))

    return () => window.clearInterval(t)
  }, [])

  const flow = useMemo(() => {
    return flowStatus.steps.map((s) => ({
      ...s,
      isCurrent: flowStatus.stage === s.key,
    }))
  }, [flowStatus.stage, flowStatus.steps])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 text-[#111111]"
    >
      <div>
        <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#111111]">Payout System</h1>
        <div className="mt-1 text-[12px] text-[#3A3A3A]">Automated payout flow + worker payment history (mock · API-ready)</div>
      </div>

      <Panel
        title="AUTOMATED PIPELINE"
        subtitle="Trigger → GPS Verification → Fraud Check → UPI Payout"
        className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
        headerClassName="border-b border-[#E5E5E5]"
      >
        <div className="flex flex-col gap-3">
          <div className="text-[11px] text-[#666666]">Current stage: <span className="text-[#111111] font-semibold">{flowStatus.stage}</span></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {flow.map((s) => (
              <div key={s.key} className={`rounded-2xl border px-4 py-4 ${s.isCurrent ? 'border-[#111111]' : 'border-[#E5E5E5]'} bg-[#FFFFFF]`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-[#111111] truncate">{s.key}</div>
                    <div className={`mt-1 text-[11px] uppercase tracking-wider ${statusClass(s.status)}`}>{s.status}</div>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-wider ${stepBadge(s.status)}`}>{s.status}</div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#E5E5E5] overflow-hidden">
                  <div
                    className={
                      'h-full ' +
                      (s.status === 'completed' ? 'bg-[#111111]' : s.status === 'failed' ? 'bg-[#FF4D4D]' : 'bg-[#FFB020]')
                    }
                    style={{ width: s.status === 'completed' ? '100%' : s.status === 'failed' ? '100%' : '60%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel
        title="WORKER PAYOUT HISTORY"
        subtitle="latest on top"
        className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
        headerClassName="border-b border-[#E5E5E5]"
        bodyClassName="px-0 py-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#666666]">
                {['Worker ID', 'Zone', 'Amount (₹)', 'Trigger Type', 'Timestamp', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 border-b border-[#E5E5E5]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payoutHistory.length === 0 ? (
                <tr>
                  <td className="px-5 py-4 text-[#666666]" colSpan={6}>
                    No payouts yet
                  </td>
                </tr>
              ) : (
                payoutHistory.map((p, idx) => (
                  <tr key={`${p.worker_id}-${p.time}-${idx}`} className="border-b border-[#E5E5E5] last:border-b-0 h-[44px]">
                    <td className="px-5 py-3 text-[#111111] truncate">{p.worker_id}</td>
                    <td className="px-5 py-3 text-[#3A3A3A] truncate">{p.zone}</td>
                    <td className="px-5 py-3 text-[#111111] tabular-nums truncate">{inr(p.amount)}</td>
                    <td className="px-5 py-3 text-[#3A3A3A] truncate">{p.trigger}</td>
                    <td className="px-5 py-3 text-[#3A3A3A] tabular-nums truncate">{p.time}</td>
                    <td className={`px-5 py-3 uppercase tracking-wider text-[10px] ${statusClass(p.status)}`}>{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="PAYOUT LOGS"
        subtitle="system events"
        className="bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]"
        headerClassName="border-b border-[#E5E5E5]"
        bodyClassName="px-0 py-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#666666]">
                {['Payout ID', 'Worker ID', 'Step', 'Timestamp', 'Result'].map((h) => (
                  <th key={h} className="px-5 py-3 border-b border-[#E5E5E5]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payoutLogs.length === 0 ? (
                <tr>
                  <td className="px-5 py-4 text-[#666666]" colSpan={5}>
                    No logs yet
                  </td>
                </tr>
              ) : (
                payoutLogs.map((l, idx) => (
                  <tr key={`${l.payout_id}-${l.timestamp}-${idx}`} className="border-b border-[#E5E5E5] last:border-b-0 h-[44px]">
                    <td className="px-5 py-3 text-[#111111] truncate">{l.payout_id}</td>
                    <td className="px-5 py-3 text-[#3A3A3A] truncate">{l.worker_id}</td>
                    <td className="px-5 py-3 text-[#3A3A3A] truncate">{l.step}</td>
                    <td className="px-5 py-3 text-[#3A3A3A] tabular-nums truncate">{l.timestamp}</td>
                    <td className={`px-5 py-3 uppercase tracking-wider text-[10px] ${statusClass(String(l.result).toLowerCase() === 'failed' ? 'failed' : String(l.result).toLowerCase() === 'processing' ? 'processing' : 'success')}`}>{l.result}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </motion.div>
  )
}
