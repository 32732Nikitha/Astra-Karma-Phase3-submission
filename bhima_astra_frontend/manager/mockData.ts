import type { Zone } from "../../components/manager/ZoneOverview";
import type { FeedEvent } from "../../components/manager/WorkerFeed";
import type { TriggerEvent } from "../../components/manager/TriggerPanel";
import type { DailyStats } from "../../components/manager/ManagerStats";

export const MOCK_ZONES: Zone[] = [
  {
    zone_id: "MUM-WEST-01",
    zone_name: "Mumbai West",
    status: "alert",
    active_workers: 67,
    disruption_level: "high",
    composite_score: 0.78,
    pending_flags: 3,
    active_payouts: 12,
  },
  {
    zone_id: "MUM-EAST-02",
    zone_name: "Mumbai East",
    status: "active",
    active_workers: 54,
    disruption_level: "medium",
    composite_score: 0.52,
    pending_flags: 1,
    active_payouts: 4,
  },
  {
    zone_id: "MUM-CNTRL-03",
    zone_name: "Mumbai Central",
    status: "stable",
    active_workers: 89,
    disruption_level: "low",
    composite_score: 0.28,
    pending_flags: 0,
    active_payouts: 0,
  },
  {
    zone_id: "MUM-SOUTH-04",
    zone_name: "Mumbai South",
    status: "stable",
    active_workers: 42,
    disruption_level: "none",
    composite_score: 0.14,
    pending_flags: 0,
    active_payouts: 0,
  },
];

const now = new Date();
const ts = (offsetSec: number) =>
  new Date(now.getTime() - offsetSec * 1000).toISOString();

export const MOCK_FEED: FeedEvent[] = [
  {
    id: "f1",
    worker_id: 1024,
    worker_name: "Vishnu Kumar",
    action: "claim_created",
    zone_id: "MUM-WEST-01",
    timestamp: ts(840),
  },
  {
    id: "f2",
    worker_id: 1031,
    worker_name: "Arjun Mehta",
    action: "payout_completed",
    zone_id: "MUM-WEST-01",
    timestamp: ts(610),
    amount: 720,
  },
  {
    id: "f3",
    worker_id: 1019,
    worker_name: "Priya Sharma",
    action: "claim_flagged",
    zone_id: "MUM-EAST-02",
    timestamp: ts(480),
  },
  {
    id: "f4",
    worker_id: 1055,
    worker_name: "Ravi Nair",
    action: "claim_approved",
    zone_id: "MUM-WEST-01",
    timestamp: ts(300),
    amount: 480,
  },
  {
    id: "f5",
    worker_id: 1062,
    worker_name: "Sneha Pillai",
    action: "worker_online",
    zone_id: "MUM-CNTRL-03",
    timestamp: ts(220),
  },
  {
    id: "f6",
    worker_id: 1044,
    worker_name: "Deepak Yadav",
    action: "payout_held",
    zone_id: "MUM-WEST-01",
    timestamp: ts(90),
    amount: 960,
  },
  {
    id: "f7",
    worker_id: 1078,
    worker_name: "Anita Reddy",
    action: "claim_created",
    zone_id: "MUM-WEST-01",
    timestamp: ts(30),
  },
];

export const MOCK_TRIGGERS: TriggerEvent[] = [
  {
    trigger_id: "t1",
    trigger_type: "rainfall",
    trigger_level: "L2",
    trigger_value: 128.4,
    zone_id: "MUM-WEST-01",
    status: "active",
    workers_affected: 67,
    fired_at: ts(720),
  },
  {
    trigger_id: "t2",
    trigger_type: "aqi",
    trigger_level: "L1",
    trigger_value: 312,
    zone_id: "MUM-EAST-02",
    status: "monitoring",
    workers_affected: 54,
    fired_at: ts(1800),
  },
  {
    trigger_id: "t3",
    trigger_type: "heat",
    trigger_level: "L1",
    trigger_value: 41.2,
    zone_id: "MUM-SOUTH-04",
    status: "resolved",
    workers_affected: 42,
    fired_at: ts(14400),
    resolved_at: ts(3600),
  },
  {
    trigger_id: "t4",
    trigger_type: "curfew",
    trigger_level: "L2",
    trigger_value: 1,
    zone_id: "MUM-WEST-01",
    status: "active",
    workers_affected: 58,
    fired_at: ts(1200),
  },
];

export const MOCK_STATS: DailyStats = {
  total_claims_today: 134,
  approved_payouts: 119,
  flagged_cases: 12,
  avg_processing_time_sec: 87,
  new_registrations: 8,
  offline_workers: 23,
};
