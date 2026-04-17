/* ══════════════════════════════════════════════════════════
   BHIMA ASTRA — Static Data Constants
   Workers, Events, Reason Labels
   ══════════════════════════════════════════════════════════ */

import type { Worker, DisruptionEvent } from './types';

export const WORKERS: Worker[] = [
  {
    idx: 0,
    id: 'W-0001', name: 'Ajay Mishra', initials: 'AM',
    platform: 'Swiggy Instamart', city: 'Delhi', zone: 'Vasant Kunj',
    vehicle: 'Bike', employment: 'Full-time',
    kyc: false, bank: true, fraud_risk: 0.3451, status: 'pending',
    tags: [
      { label: 'Bike Delivery', cls: '' },
      { label: 'Full-time', cls: '' },
      { label: 'KYC: Unverified', cls: 'warn' },
      { label: 'Risk: 0.3451', cls: '' }
    ],
    synthetic: false,
    features: {
      gps_tower_delta: 63.5,
      accelerometer_variance: 12.728,
      claim_response_time_sec: 282,
      app_interaction_count: 37,
      device_flagged: 0,
      location_jump_flag: 0
    },
    graph: { cluster_size: 2, fraud_cluster_score: 0.18, tabular_prob: 0.085 }
  },
  {
    idx: 1,
    id: 'W-0002', name: 'Pooja Sharma', initials: 'PS',
    platform: 'Zepto', city: 'Jaipur', zone: 'Sanganer',
    vehicle: 'Bike', employment: 'Full-time',
    kyc: true, bank: false, fraud_risk: 0.6571, status: 'flagged',
    tags: [
      { label: 'Bike Delivery', cls: '' },
      { label: 'Full-time', cls: '' },
      { label: 'Bank: Unverified', cls: 'warn' },
      { label: 'Risk: 0.6571', cls: 'warn' }
    ],
    synthetic: false,
    features: {
      gps_tower_delta: 820,
      accelerometer_variance: 0.3,
      claim_response_time_sec: 28,
      app_interaction_count: 2,
      device_flagged: 1,
      location_jump_flag: 1
    },
    graph: { cluster_size: 4, fraud_cluster_score: 0.4116, tabular_prob: 0.72 }
  },
  {
    idx: 2,
    id: 'W-0003', name: 'Sarla Tripathi', initials: 'ST',
    platform: 'Amazon Now', city: 'Hyderabad', zone: 'Mehdipatnam',
    vehicle: 'Bike', employment: 'Full-time',
    kyc: true, bank: true, fraud_risk: 0.2202, status: 'verified',
    tags: [
      { label: 'Bike Delivery', cls: '' },
      { label: 'Full-time', cls: '' },
      { label: 'KYC: Verified', cls: '' },
      { label: 'Risk: 0.2202', cls: '' }
    ],
    synthetic: false,
    features: {
      gps_tower_delta: 22,
      accelerometer_variance: 18.5,
      claim_response_time_sec: 450,
      app_interaction_count: 41,
      device_flagged: 0,
      location_jump_flag: 0
    },
    graph: { cluster_size: 1, fraud_cluster_score: 0.05, tabular_prob: 0.11 }
  },
  {
    idx: 3,
    id: 'W-0004', name: 'Srikanth Sharma', initials: 'SS',
    platform: 'Swiggy Instamart', city: 'Hyderabad', zone: 'Banjara Hills',
    vehicle: 'Bike', employment: 'Full-time',
    kyc: true, bank: true, fraud_risk: 0.2578, status: 'verified',
    tags: [
      { label: 'Bike Delivery', cls: '' },
      { label: 'Full-time', cls: '' },
      { label: 'KYC: Verified', cls: '' },
      { label: 'Risk: 0.2578', cls: '' }
    ],
    synthetic: false,
    features: {
      gps_tower_delta: 550,
      accelerometer_variance: 3.2,
      claim_response_time_sec: 45,
      app_interaction_count: 5,
      device_flagged: 0,
      location_jump_flag: 0
    },
    graph: { cluster_size: 2, fraud_cluster_score: 0.22, tabular_prob: 0.42 }
  },
  {
    idx: 4,
    id: 'W-SYNTH', name: 'Synthetic Trace', initials: 'SY',
    platform: 'Unknown', city: '—', zone: 'Auto-generated',
    vehicle: '—', employment: '—',
    kyc: false, bank: false, fraud_risk: 0.55, status: 'synthetic',
    tags: [
      { label: 'Synthetic Trace', cls: 'warn' },
      { label: 'Auto-generated', cls: '' },
      { label: 'No Historical Data', cls: '' }
    ],
    synthetic: true,
    features: {
      gps_tower_delta: 350,
      accelerometer_variance: 6.0,
      claim_response_time_sec: 90,
      app_interaction_count: 15,
      device_flagged: 0,
      location_jump_flag: 0
    },
    graph: { cluster_size: 3, fraud_cluster_score: 0.31, tabular_prob: 0.45 }
  }
];

export const EVENTS: DisruptionEvent[] = [
  {
    id: 'EVT-C001', day: 1, hour: 14,
    rainfall: 1.6, aqi: 338, traffic: 86.6, composite: 0.4935,
    label: 'High AQI — Moderate disruption',
    trigger: 'aqi',
    flood_alert: 0, road_closure: 0
  },
  {
    id: 'EVT-C004', day: 4, hour: 15,
    rainfall: 7.2, aqi: 465, traffic: 56.9, composite: 0.5465,
    label: 'Critical AQI event + light rain',
    trigger: 'aqi,rainfall',
    flood_alert: 0, road_closure: 0
  },
  {
    id: 'EVT-C112', day: 3, hour: 9,
    rainfall: 52.3, aqi: 280, traffic: 92.4, composite: 0.7810,
    label: 'Heavy rainfall + traffic surge',
    trigger: 'rainfall,traffic',
    flood_alert: 1, road_closure: 1
  },
  {
    id: 'EVT-C003', day: 3, hour: 9,
    rainfall: 0.3, aqi: 457, traffic: 64.6, composite: 0.4895,
    label: 'Severe AQI — Work disruption',
    trigger: 'aqi',
    flood_alert: 0, road_closure: 0
  },
  {
    id: 'EVT-C201', day: 2, hour: 11,
    rainfall: 12.1, aqi: 180, traffic: 76.2, composite: 0.4600,
    label: 'Moderate traffic + rain',
    trigger: 'traffic',
    flood_alert: 0, road_closure: 0
  },
  {
    id: 'EVT-CRIT', day: 5, hour: 16,
    rainfall: 68.4, aqi: 490, traffic: 98.1, composite: 0.9240,
    label: 'CRITICAL — All sensors exceeded',
    trigger: 'rainfall,aqi,traffic',
    flood_alert: 1, road_closure: 1
  }
];

export const REASON_LABELS: Record<string, string> = {
  'normal': 'Clean Signal Detected',
  'gps_mismatch': 'GPS / Cell Tower Mismatch',
  'device_anomaly': 'Device Behavioral Anomaly',
  'abnormal_behavior': 'Abnormal Filing Speed',
  'ring_cluster': 'Fraud Ring Cluster Detected',
  'behavioral_anomaly': 'LSTM Behavioral Anomaly',
  'rule_triggered': 'Deterministic Rule Triggered',
  'high_tabular_prob': 'High XGBoost Fraud Probability',
  'multi_factor': 'Multi-Factor Risk Signal'
};

export const REASON_SUBS: Record<string, string> = {
  'normal': 'All pipeline stages returned clean scores. Payout approved.',
  'gps_mismatch': 'GPS coordinates do not match cell tower triangulation.',
  'device_anomaly': 'Accelerometer signature indicates stationary GPS spoofing.',
  'abnormal_behavior': 'Claim filed in under 60 seconds — possible bot activity.',
  'ring_cluster': 'Worker connected to a multi-node fraud cluster.',
  'behavioral_anomaly': 'LSTM behavior score exceeds anomaly threshold of 0.70.',
  'rule_triggered': 'Deterministic rule engine flagged this claim for review.',
  'high_tabular_prob': 'XGBoost model assigned high fraud probability.',
  'multi_factor': 'Multiple weak signals converge above decision threshold.'
};
