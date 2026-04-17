import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import { useWorker } from "../context/WorkerContext";
import { updateWorkerProfile } from "../services/api";

/* ─── Style tokens (mirrors Dashboard typography) ─────────── */
const mono = (size = 9): React.CSSProperties => ({
  fontFamily: "DM Mono, monospace",
  fontSize: size + 4,
  letterSpacing: "0.12em",
});
const editorial = (size = 36): React.CSSProperties => ({
  fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif",
  fontSize: size + 4,
  letterSpacing: "0.03em",
  lineHeight: 1,
});

/* ─── Purple accent (royal purple) ────────────────────────── */
const PURPLE = "rgba(124, 58, 237, 1)";
const PURPLE_MID = "rgba(124, 58, 237, 0.6)";
const PURPLE_LOW = "rgba(124, 58, 237, 0.15)";

/* ─── Admin card wrapper ───────────────────────────────────── */
const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
}> = ({ children, style, accentColor }) => (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      ...style,
    }}
  >
    {accentColor && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accentColor,
          borderRadius: "12px 12px 0 0",
        }}
      />
    )}
    {children}
  </div>
);

/* ─── Toggle Switch ──────────────────────────────────────── */
const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}> = ({ checked, onChange, color = "#7C3AED" }) => (
  <button
    onClick={() => onChange(!checked)}
    aria-checked={checked}
    role="switch"
    style={{
      width: 44,
      height: 24,
      background: checked ? color : "#111827",
      borderRadius: 999,
      border: "none",
      cursor: "pointer",
      position: "relative",
      transition: "background 0.3s ease",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 3,
        left: checked ? 23 : 3,
        width: 18,
        height: 18,
        background: "#fff",
        borderRadius: "50%",
        transition: "left 0.3s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }}
    />
  </button>
);

/* ─── Fraud Risk Score Ring ─────────────────────────────── */
const FraudRingScore: React.FC<{ score: number }> = ({ score }) => {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const pct = score / 100;
  const label =
    score < 35 ? "Low Risk" : score < 65 ? "Medium Risk" : "High Risk";
  const color = score < 35 ? "#22c55e" : score < 65 ? "#FBBF24" : "#FF5C5C";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <svg width={108} height={108} viewBox="0 0 108 108">
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 1s ease, stroke 0.4s ease",
            filter: `drop-shadow(0 0 6px ${color}66)`,
          }}
        />
        <text
          x="54"
          y="50"
          textAnchor="middle"
          fill="#111827"
          fontSize="22"
          fontFamily="'Bebas Neue', sans-serif"
        >
          {score}
        </text>
        <text
          x="54"
          y="64"
          textAnchor="middle"
          fill="#6b7280"
          fontSize="9"
          fontFamily="'DM Mono', monospace"
        >
          /100
        </text>
      </svg>
      <span
        style={{
          ...mono(9),
          color,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PROFILE PAGE COMPONENT
═══════════════════════════════════════════════════════════ */
interface ProfilePageFullProps {
  onLogout: () => void;
}

const ProfilePageFull: React.FC<ProfilePageFullProps> = ({ onLogout }) => {
  /* ── Context ────────────────────────────────────── */
  const { profile, refresh } = useWorker();

  /* ── State ─────────────────────────────────────── */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [saveAnim, setSaveAnim] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [upiIds, setUpiIds] = useState<{ id: string; primary: boolean }[]>([]);
  const [newUpi, setNewUpi] = useState("");
  const [showAddUpi, setShowAddUpi] = useState(false);

  const ZONES = [
    "Zone A-7",
    "Zone B-2",
    "Zone C-5",
    "Zone D-1",
    "Zone E-9",
    "Yanamalakuduru",
    "Vijayawada City",
  ];
  const [selectedZone, setSelectedZone] = useState("");

  /* ── Seed form from real profile when it loads ──── */
  useEffect(() => {
    if (!profile) return;
    if (profile.worker_name) setName(profile.worker_name);
    if (profile.phone_number) setPhone(`+91 ${profile.phone_number}`);
    if (profile.city) setCity(profile.city);
    if (profile.geo_zone_id) setSelectedZone(profile.geo_zone_id);
    if (profile.upi_id) {
      setUpiIds([{ id: profile.upi_id, primary: true }]);
    }
  }, [profile]);

  /* ── Fraud score: 0–1 from backend → 0–100 for UI ─ */
  const fraudScoreDisplay =
    profile?.fraud_risk_score != null
      ? Math.round(profile.fraud_risk_score * 100)
      : 28;

  const [notifs, setNotifs] = useState({
    payout: true,
    whatsapp: true,
    email: false,
    sms: true,
  });

  const LANGS = [
    { code: "EN", name: "English", flag: "ENG", fontColor: "#fff" },
    { code: "TE", name: "Telugu", flag: "TEL" },
    { code: "HI", name: "Hindi", flag: "HIN" },
    { code: "TA", name: "Tamil", flag: "TAM" },
  ];
  const [lang, setLang] = useState("EN");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setSaveAnim(true);
    setSaveError(null);
    try {
      if (profile?.worker_id) {
        await updateWorkerProfile(profile.worker_id, {
          worker_name: name,
          city,
          geo_zone_id: selectedZone,
          upi_id: upiIds.find((u) => u.primary)?.id,
        });
        await refresh();
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes",
      );
    } finally {
      setTimeout(() => setSaveAnim(false), 2000);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // HEADER
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237);
    doc.text("BHIMA ASTRA", 20, 20);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Policy Document", 20, 30);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Policy Number: GS-POL-${Math.floor(100000 + Math.random() * 900000)}`,
      20,
      40,
    );
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, 46);
    doc.text(
      `Valid Till: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}`,
      20,
      52,
    );

    doc.line(20, 58, 190, 58);

    // USER DETAILS
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("User Details", 20, 68);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Full Name: ${name}`, 20, 78);
    doc.text(`Phone: ${phone}`, 20, 84);
    doc.text(`Email: ${email}`, 20, 90);
    doc.text(`City / Zone: ${city} / ${selectedZone}`, 20, 96);

    doc.line(20, 102, 190, 102);

    // POLICY DETAILS
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Policy Details", 20, 112);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text("Plan Type: Standard", 20, 122);
    doc.text("Coverage Amount: INR 50,000", 20, 128);
    doc.text("Monthly Premium: INR 299", 20, 134);
    doc.text("Active Status: Active", 20, 140);
    doc.text("Max Events: 3 per year", 20, 146);

    doc.line(20, 152, 190, 152);

    // COVERAGE
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Coverage Included", 20, 162);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text("- Rainfall Protection", 20, 172);
    doc.text("- Heat Index Protection", 20, 178);
    doc.text("- AQI Protection", 20, 184);
    doc.text("- Cyclone Coverage", 20, 190);

    doc.line(20, 196, 190, 196);

    // PAYOUT DETAILS
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Payout Details", 20, 206);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text("Per event payout: INR 1,500", 20, 216);
    doc.text("Max payout limit: INR 50,000", 20, 222);
    doc.text("Event cap: 3 events", 20, 228);

    doc.line(20, 234, 190, 234);

    // EXCLUSIONS
    doc.setFontSize(14);
    doc.setTextColor(255, 60, 60);
    doc.text("Exclusions (NOT Covered)", 20, 244);

    doc.setFontSize(11);
    doc.setTextColor(200, 0, 0);
    doc.text("- Wars are NOT covered", 20, 254);
    doc.text("- Accidents are NOT covered", 20, 260);
    doc.text("- Vehicle damage is NOT covered", 20, 266);

    doc.save("BHIMA ASTRA-Policy.pdf");
  };

  const handleAddUpi = () => {
    if (newUpi.trim() && newUpi.includes("@")) {
      setUpiIds((prev) => [...prev, { id: newUpi.trim(), primary: false }]);
      setNewUpi("");
      setShowAddUpi(false);
    }
  };

  const handleSetPrimary = (targetId: string) => {
    setUpiIds((prev) =>
      prev.map((u) => ({ ...u, primary: u.id === targetId })),
    );
  };

  const handleDeleteUpi = (targetId: string) => {
    setUpiIds((prev) => prev.filter((u) => u.id !== targetId));
  };

  /* ── Input style ───────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "11px 14px",
    color: "#111827",
    ...mono(10),
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    ...mono(8),
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div style={{ padding: "0 0 80px", color: "#111827" }}>
      {/* ── Inline styles for this page ──────────── */}
      <style>{`
        .profile-input:focus {
          border-color: #7C3AED !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
        .profile-page-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .profile-page-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 1200px) {
          .profile-page-grid {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
        .profile-header-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
          padding: 36px 40px 32px;
        }
        @media (min-width: 768px) {
          .profile-header-row {
            flex-direction: row;
            align-items: center;
          }
        }
        .upi-chip {
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .upi-chip:hover { background: #f3f0ff !important; border-color: rgba(124,58,237,0.3) !important; }
        .zone-chip {
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 999px;
          padding: 7px 16px;
          font-size: 9px;
          letter-spacing: 0.12em;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          color: #111827;
        }
        .zone-chip.active {
          background: rgba(124,58,237,0.1) !important;
          border-color: rgba(124,58,237,0.5) !important;
          color: #7C3AED !important;
        }
        .profile-logout-btn:hover {
          background: rgba(255,92,92,0.06) !important;
          border-color: rgba(255,92,92,0.6) !important;
        }
        .profile-delete-btn:hover {
          background: rgba(255,92,92,0.08) !important;
        }
        .lang-card {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lang-card.selected {
          border-color: rgba(124,58,237,0.5) !important;
          background: rgba(124,58,237,0.07) !important;
        }
        .lang-card:hover:not(.selected) {
          border-color: #111827 !important;
          background: #f9fafb !important;
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HEADER CARD
      ══════════════════════════════════════════ */}
      <GlassCard accentColor={PURPLE} style={{ marginBottom: 24 }}>
        <div className="profile-header-row">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${PURPLE_LOW}, rgba(37,117,252,0.12))`,
              border: `1px solid ${PURPLE_MID}`,
              boxShadow: `0 0 20px ${PURPLE_LOW}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              ...editorial(26),
              color: PURPLE,
            }}
          >
            RK
          </motion.div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ ...editorial(32), color: "#111827", marginBottom: 4 }}
            >
              {name}
            </div>
            <div style={{ ...mono(9), color: "#111827", marginBottom: 10 }}>
              {email}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                className="badge"
                style={{
                  background: PURPLE_LOW,
                  border: `1px solid ${PURPLE_MID}`,
                  color: PURPLE,
                  borderRadius: 999,
                  padding: "3px 12px",
                  ...mono(8),
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                ✦ Standard Plan
              </span>
              <span className="badge badge-green">
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
                KYC Verified
              </span>
              <span className="badge badge-amber">Renewal in 20d</span>
            </div>

            <div>
              <button
                onClick={generatePDF}
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 14px",
                  color: "#111827",
                  ...mono(9),
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <polyline points="9 15 12 18 15 15"></polyline>
                </svg>
                Download Policy PDF
              </button>
            </div>
          </div>

          {/* Fraud Risk on the right */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                ...mono(8),
                color: "#111827",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              Fraud Risk Score
            </span>
            <FraudRingScore score={fraudScoreDisplay} />
          </div>
        </div>
      </GlassCard>

      {/* ══════════════════════════════════════════
          MAIN GRID
      ══════════════════════════════════════════ */}
      <div className="profile-page-grid">
        {/* ── Personal Information ─────────────── */}
        <GlassCard accentColor="#60A5FA" style={{ padding: "28px 24px" }}>
          <div
            style={{
              ...mono(8),
              color: "#111827",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 20,
            }}
          >
            Personal Information
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Full Name", val: name, set: setName, key: "name" },
              { label: "Phone", val: phone, set: setPhone, key: "phone" },
              { label: "Email", val: email, set: setEmail, key: "email" },
              { label: "City", val: city, set: setCity, key: "city" },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <input
                  className="profile-input"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <motion.button
            className={saveAnim ? "btn-outline" : "btn-primary"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            style={{
              marginTop: 20,
              width: "100%",
              justifyContent: "center",
              ...(saveAnim
                ? {
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "#fff",
                    borderColor: "rgba(34,197,94,0.4)",
                  }
                : {}),
            }}
          >
            {saveAnim ? "✓ Saved" : "Save Changes"}
          </motion.button>
          {saveError && (
            <div
              style={{
                marginTop: 8,
                fontFamily: "DM Mono, monospace",
                fontSize: 12,
                color: "#FF5C5C",
                letterSpacing: "0.08em",
              }}
            >
              ⚠ {saveError}
            </div>
          )}
        </GlassCard>

        {/* ── UPI Accounts ─────────────────────── */}
        <GlassCard accentColor="#00D1B2" style={{ padding: "28px 24px" }}>
          <div
            style={{
              ...mono(8),
              color: "#111827",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 20,
            }}
          >
            UPI Accounts
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <AnimatePresence>
              {upiIds.map(({ id, primary }) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="upi-chip"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: primary ? PURPLE_LOW : "#f9fafb",
                    border: primary
                      ? `1px solid ${PURPLE_MID}`
                      : "1px solid #e5e7eb",
                    borderRadius: 10,
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        ...mono(10),
                        color: "#111827",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {id}
                    </div>
                    {primary && (
                      <div
                        style={{
                          ...mono(7),
                          color: PURPLE,
                          marginTop: 2,
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                        }}
                      >
                        Primary
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!primary && (
                      <button
                        onClick={() => handleSetPrimary(id)}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          padding: "4px 8px",
                          color: "#111827",
                          cursor: "pointer",
                          ...mono(7),
                          transition: "all 0.2s",
                        }}
                      >
                        Set Primary
                      </button>
                    )}
                    {!primary && (
                      <button
                        onClick={() => handleDeleteUpi(id)}
                        style={{
                          background: "#fff5f5",
                          border: "1px solid rgba(255,92,92,0.3)",
                          borderRadius: 6,
                          padding: "4px 8px",
                          width: 30,
                          color: "#FF5C5C",
                          cursor: "pointer",
                          ...mono(7),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showAddUpi && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden", marginBottom: 10 }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="profile-input"
                    value={newUpi}
                    onChange={(e) => setNewUpi(e.target.value)}
                    placeholder="yourname@upi"
                    style={{ ...inputStyle, flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddUpi();
                    }}
                  />
                  <button
                    onClick={handleAddUpi}
                    style={{
                      background: `linear-gradient(135deg, ${PURPLE}, #2575fc)`,
                      border: "none",
                      borderRadius: 8,
                      padding: "0 14px",
                      color: "#fff",
                      cursor: "pointer",
                      ...mono(9),
                      flexShrink: 0,
                    }}
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowAddUpi((v) => !v)}
            style={{
              width: "100%",
              background: "none",
              border: `1px dashed rgba(124,58,237,0.35)`,
              borderRadius: 10,
              padding: "10px",
              color: "#A78BFA",
              cursor: "pointer",
              ...mono(9),
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              transition: "all 0.2s ease",
            }}
          >
            {showAddUpi ? "✕ Cancel" : "+ Add UPI ID"}
          </button>
        </GlassCard>

        {/* ── Zone Settings ────────────────────── */}
        <GlassCard accentColor="#FBBF24" style={{ padding: "28px 24px" }}>
          <div
            style={{
              ...mono(8),
              color: "#111827",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 20,
            }}
          >
            Zone Settings
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {ZONES.map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`zone-chip ${selectedZone === zone ? "active" : ""}`}
                style={{
                  background:
                    selectedZone === zone ? "rgba(124,58,237,0.1)" : "#f9fafb",
                  border:
                    selectedZone === zone
                      ? "1px solid rgba(124,58,237,0.5)"
                      : "1px solid #d1d5db",
                  color: selectedZone === zone ? PURPLE : "#111827",
                  borderRadius: 999,
                  padding: "7px 16px",
                  ...mono(8),
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                }}
              >
                {zone}
              </button>
            ))}
          </div>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Update Zone
          </motion.button>
        </GlassCard>

        {/* ── Notifications ────────────────────── */}
        <GlassCard accentColor="#22c55e" style={{ padding: "28px 24px" }}>
          <div
            style={{
              ...mono(8),
              color: "#111827",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 20,
            }}
          >
            Notifications
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(
              [
                {
                  key: "payout",
                  label: "Payout Alerts",
                  desc: "Get notified on every payout",
                },
                {
                  key: "whatsapp",
                  label: "WhatsApp",
                  desc: "Messages via WhatsApp",
                },
                {
                  key: "email",
                  label: "Email",
                  desc: "Weekly summaries & updates",
                },
                {
                  key: "sms",
                  label: "SMS",
                  desc: "Critical event alerts only",
                },
              ] as Array<{
                key: keyof typeof notifs;
                label: string;
                desc: string;
              }>
            ).map(({ key, label, desc }) => (
              <div
                key={key}
                className="data-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 0",
                }}
              >
                <div>
                  <div
                    style={{ ...mono(10), color: "#111827", marginBottom: 3 }}
                  >
                    {label}
                  </div>
                  <div style={{ ...mono(8), color: "#111827" }}>{desc}</div>
                </div>
                <Toggle
                  checked={notifs[key]}
                  onChange={(v) => setNotifs((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* ── Language ─────────────────────────── */}
        <GlassCard accentColor="#60A5FA" style={{ padding: "28px 24px" }}>
          <div
            style={{
              ...mono(8),
              color: "#111827",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 20,
            }}
          >
            Language
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {LANGS.map(({ code, name, flag }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`lang-card ${lang === code ? "selected" : ""}`}
                style={{
                  background:
                    lang === code ? "rgba(124,58,237,0.07)" : "#f9fafb",
                  border:
                    lang === code
                      ? "1px solid rgba(124,58,237,0.5)"
                      : "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "14px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 22 }}>{flag}</span>
                <div
                  style={{
                    ...mono(9),
                    color: lang === code ? PURPLE : "#111827",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  {code}
                </div>
                <div
                  style={{
                    ...mono(8),
                    color: lang === code ? PURPLE : "#111827",
                  }}
                >
                  {name}
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* ── Danger Zone ──────────────────────── */}
        <GlassCard
          style={{
            padding: "28px 24px",
            border: "1px solid rgba(255,92,92,0.25)",
          }}
        >
          <div
            style={{
              ...mono(8),
              color: "#FF5C5C",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 8,
            }}
          >
            ⚠ Danger Zone
          </div>
          <div
            style={{
              ...mono(9),
              color: "#111827",
              marginBottom: 20,
              lineHeight: 1.7,
            }}
          >
            Deleting your account is irreversible. All your policies, payout
            history, and data will be permanently removed.
          </div>

          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden", marginBottom: 12 }}
              >
                <div
                  style={{
                    background: "#fff5f5",
                    border: "1px solid rgba(255,92,92,0.3)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 0,
                  }}
                >
                  <div
                    style={{ ...mono(9), color: "#FF5C5C", marginBottom: 10 }}
                  >
                    Are you absolutely sure? This cannot be undone.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{
                        flex: 1,
                        background: "#fff0f0",
                        border: "1px solid rgba(255,92,92,0.4)",
                        borderRadius: 8,
                        padding: "10px",
                        color: "#FF5C5C",
                        cursor: "pointer",
                        ...mono(8),
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                      }}
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        flex: 1,
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "10px",
                        color: "#111827",
                        cursor: "pointer",
                        ...mono(8),
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className="profile-delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: "100%",
              background: "rgba(255,92,92,0.05)",
              border: "1px solid rgba(255,92,92,0.3)",
              borderRadius: 10,
              padding: "12px",
              color: "#FF5C5C",
              cursor: "pointer",
              ...mono(9),
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              transition: "all 0.25s ease",
            }}
          >
            Delete Account
          </button>
        </GlassCard>
      </div>

      {/* ══════════════════════════════════════════
          LOGOUT BUTTON (bottom)
      ══════════════════════════════════════════ */}
      <div style={{ marginTop: 30 }}>
        <motion.button
          className="profile-logout-btn"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          style={{
            width: "100%",
            background: "none",
            border: "1px solid rgba(255,92,92,0.3)",
            borderRadius: 12,
            padding: "16px",
            color: "#FF5C5C",
            cursor: "pointer",
            ...mono(10),
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </motion.button>
      </div>
    </div>
  );
};

export default ProfilePageFull;
