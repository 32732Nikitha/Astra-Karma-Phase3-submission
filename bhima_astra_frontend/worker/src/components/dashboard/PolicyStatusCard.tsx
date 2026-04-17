import React from 'react';
import { motion } from 'framer-motion';
import { formatINR } from '../../utils/currency';

const mono = { fontFamily: 'DM Mono, monospace' } as React.CSSProperties;
const editorial = {
  fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
  letterSpacing: '0.02em',
  lineHeight: 1,
} as React.CSSProperties;

const PolicyStatusCard: React.FC = () => {
  const expiry = new Date('2026-04-30');
  const daysLeft = Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / 86400000));
  const isUrgent = daysLeft <= 14;

  const stats = [
    { label: 'Events Left', value: '4', sub: 'of 5 this month' },
    { label: 'Weekly Premium', value: formatINR(19.75), sub: `${formatINR(79)}/month billed` },
    { label: 'Coverage', value: formatINR(50000), sub: 'per trigger event', color: '#22c55e' },
    { label: 'Expires In', value: `${daysLeft}d`, sub: '30 Apr 2026', urgent: isUrgent },
  ];

  return (
    <motion.div
      style={{
        padding: '26px 28px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px 0px -30% 0px' }}
      transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ ...mono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#111827' }}>
          Policy Status
        </span>
        <span style={{
          ...mono, fontSize: 8, padding: '3px 10px', borderRadius: 4,
          border: '1px solid #e5e7eb', color: '#111827',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          Standard Plan
        </span>
      </div>

      {/* Active badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div className={isUrgent ? 'glow-red' : 'glow-green'} style={{
          width: 8, height: 8, background: isUrgent ? '#FF5C5C' : '#22c55e',
          borderRadius: '50%', flexShrink: 0,
        }} />
        <span style={{ ...mono, fontSize: 14, color: isUrgent ? '#FF5C5C' : '#22c55e', letterSpacing: '0.08em' }}>
          ACTIVE · KYC VERIFIED
        </span>
      </div>

      {/* Stats 2×2 grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        borderTop: '1px solid #f3f4f6',
        flex: 1, borderRadius: 8, overflow: 'hidden',
      }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            padding: '16px 4px',
            paddingLeft: i % 2 === 1 ? 16 : 0,
            borderRight: i % 2 === 0 ? '1px solid #f3f4f6' : 'none',
            borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none',
          }}>
            <div style={{ ...mono, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#111827', marginBottom: 5 }}>
              {s.label}
            </div>
            <div style={{ ...editorial, fontSize: 26, color: s.urgent ? '#FF5C5C' : s.color ?? '#111827' }}>
              {s.value}
            </div>
            <div style={{ ...mono, fontSize: 8, color: '#111827', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Renew CTA */}
      <motion.button
        whileHover={{ background: '#22c55e', color: '#000', borderColor: '#22c55e' }}
        transition={{ duration: 0.2 }}
        style={{
          marginTop: 18, width: '100%', padding: '11px',
          background: 'none', border: '1px solid rgba(34,197,94,0.35)',
          color: '#22c55e', ...mono, fontSize: 10, letterSpacing: '0.2em',
          textTransform: 'uppercase', cursor: 'pointer', borderRadius: 8,
          transition: 'all 0.2s',
        }}
      >
        Renew Policy →
      </motion.button>
    </motion.div>
  );
};

export default PolicyStatusCard;
