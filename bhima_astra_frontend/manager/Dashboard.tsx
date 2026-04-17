import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  MapPin,
  Users,
  DollarSign,
  AlertTriangle,
  Wifi,
  WifiOff,
  Bell,
  LogOut,
} from "lucide-react";
import ManagerZoneMap from "./ManagerZoneMap";

// Single zone for dark store manager
const MANAGER_ZONE = {
  id: "MUM-WEST-01",
  name: "Andheri West Dark Store",
  active_workers: 67,
  composite_score: 0.45,
  last_trigger: { type: "rainfall", time: "2h ago", severity: "L2" },
  pending_flags: 2,
  active_payouts: 3,
  status: "normal",
};

// Mock worker feed data
const MOCK_WORKER_FEED = [
  {
    id: 1,
    worker_name: "Raj Kumar",
    worker_id: 1024,
    status: "online",
    income_today: 820,
    orders_today: 18,
    fraud_risk_score: 0.12,
    policy_status: "active",
    zone_id: "MUM-WEST-01",
    last_gps: { lat: 19.076, lng: 72.8777 },
    timestamp: new Date().toISOString(),
  },
  {
    id: 2,
    worker_name: "Priya Sharma",
    worker_id: 1025,
    status: "offline",
    income_today: 450,
    orders_today: 12,
    fraud_risk_score: 0.08,
    policy_status: "active",
    zone_id: "MUM-EAST-02",
    last_gps: { lat: 19.084, lng: 72.889 },
    timestamp: new Date().toISOString(),
  },
];

// Mock trigger events
const MOCK_TRIGGERS = [
  {
    id: 1,
    zone_id: "MUM-EAST-02",
    trigger_type: "heat",
    severity: "L1",
    timestamp: "2026-04-15T13:30:00Z",
    workers_affected: 45,
    total_payout: 22500,
    fraud_holds: 2,
  },
  {
    id: 2,
    zone_id: "MUM-WEST-01",
    trigger_type: "rainfall",
    severity: "L2",
    timestamp: "2026-04-15T11:15:00Z",
    workers_affected: 67,
    total_payout: 40200,
    fraud_holds: 1,
  },
];

// Mock stats
const MOCK_STATS = {
  new_registrations: 38,
  payouts_processed: 285600,
  flags_raised: 3,
  offline_workers_paid: 12,
  fraud_holds: 2,
};

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [workerFeed, setWorkerFeed] = useState(MOCK_WORKER_FEED);

  const handleLogout = () => {
    localStorage.removeItem("managerLoggedIn");
    window.location.href = "/manager/login";
  };

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate real-time worker updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate worker status changes
      setWorkerFeed((prev) =>
        prev.map((worker) => ({
          ...worker,
          status:
            Math.random() > 0.7
              ? worker.status === "online"
                ? "offline"
                : "online"
              : worker.status,
          income_today:
            worker.status === "online"
              ? worker.income_today + Math.floor(Math.random() * 50)
              : worker.income_today,
        })),
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number): string => {
    if (score < 0.4) return "#7A9F8C";
    if (score < 0.65) return "#8B7355";
    return "#A55F4F";
  };

  const getRiskColor = (score: number): string => {
    if (score < 0.3) return "#7A9F8C";
    if (score < 0.7) return "#8B7355";
    return "#A55F4F";
  };

  const getPolicyColor = (status: string): string => {
    if (status === "active") return "#7A9F8C";
    if (status === "pending") return "#CDA955";
    return "#A55F4F";
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f8f8" }}>
      {/* Header Navigation */}
      <header
        className="bg-white"
        style={{ borderBottom: "1px solid #e8e8e8" }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10"
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield className="w-6 h-6" style={{ color: "#ffffff" }} />
              </div>
              <div>
                <h1
                  className="font-display"
                  style={{
                    fontSize: "1.1875rem",
                    fontWeight: 700,
                    color: "#000000",
                  }}
                >
                  BHIMA ASTRA
                </h1>
                <p className="ui-label" style={{ color: "#666666" }}>
                  Dark Store Manager
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate("/manager/dashboard")}
                className="ui-text font-medium transition-colors"
                style={{ color: "#000000", fontWeight: 600 }}
              >
                DASHBOARD
              </button>
              <button
                onClick={() => navigate("/manager/flag-disruption")}
                className="ui-text font-medium transition-colors"
                style={{ color: "#666666", fontWeight: 600 }}
              >
                FLAG DISRUPTION
              </button>
              <button
                onClick={() => navigate("/manager/workers")}
                className="ui-text font-medium transition-colors"
                style={{ color: "#666666", fontWeight: 600 }}
              >
                WORKERS
              </button>
              <button
                onClick={() => navigate("/manager/flag-history")}
                className="ui-text font-medium transition-colors"
                style={{ color: "#666666", fontWeight: 600 }}
              >
                FLAG HISTORY
              </button>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <div className="ui-text">
                {currentTime.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="relative">
                <Bell
                  className="w-5 h-5"
                  style={{ color: "#666666", cursor: "pointer" }}
                />
                {MANAGER_ZONE.status === "alert" && (
                  <div
                    c
                onClick={handleLogout}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              lassName="absolute -top-1 -right-1 w-2 h-2"
                    style={{ backgroundColor: "#1a1a1a", borderRadius: "50%" }}
                  ></div>
                )}
              </div>
              <button>
                <LogOut className="w-5 h-5" style={{ color: "#666666" }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <div className="ui-label mb-2">
            Dark Store Management · Live Overview
          </div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: "2.6875rem", fontWeight: 700, color: "#000000" }}
          >
            {MANAGER_ZONE.name}
          </h1>
          <p className="ui-text" style={{ color: "#666666" }}>
            Managing{" "}
            <span style={{ color: "#000000", fontWeight: 700 }}>
              {MANAGER_ZONE.active_workers}
            </span>{" "}
            active workers
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg"
            style={{
              border: "1px solid #e8e8e8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="ui-label">New Registrations</p>
                <p
                  className="ui-data"
                  style={{ fontSize: "1.6875rem", marginTop: "4px" }}
                >
                  {MOCK_STATS.new_registrations}
                </p>
              </div>
              <Users className="w-8 h-8" style={{ color: "#cccccc" }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-lg"
            style={{
              border: "1px solid #e8e8e8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="ui-label">Payouts Processed</p>
                <p
                  className="ui-data"
                  style={{ fontSize: "1.6875rem", marginTop: "4px" }}
                >
                  ₹{MOCK_STATS.payouts_processed.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8" style={{ color: "#cccccc" }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg"
            style={{
              border: "1px solid #e8e8e8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="ui-label">Flags Raised</p>
                <p
                  className="ui-data"
                  style={{ fontSize: "1.6875rem", marginTop: "4px" }}
                >
                  {MOCK_STATS.flags_raised}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8" style={{ color: "#cccccc" }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-lg"
            style={{
              border: "1px solid #e8e8e8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="ui-label">Offline Workers Paid</p>
                <p
                  className="ui-data"
                  style={{ fontSize: "1.6875rem", marginTop: "4px" }}
                >
                  {MOCK_STATS.offline_workers_paid}
                </p>
              </div>
              <WifiOff className="w-8 h-8" style={{ color: "#cccccc" }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-lg"
            style={{
              border: "1px solid #e8e8e8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="ui-label">Fraud Holds</p>
                <p
                  className="ui-data"
                  style={{ fontSize: "1.6875rem", marginTop: "4px" }}
                >
                  {MOCK_STATS.fraud_holds}
                </p>
              </div>
              <Shield className="w-8 h-8" style={{ color: "#cccccc" }} />
            </div>
          </motion.div>
        </div>

        {/* Zone Overview */}
        <div className="mb-8">
          <h2
            className="font-display mb-4"
            style={{ fontSize: "1.6875rem", fontWeight: 700, color: "#000000" }}
          >
            Zone Overview
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-lg cursor-pointer transition-colors"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e8e8e8" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="ui-data" style={{ fontSize: "1.3125rem" }}>
                {MANAGER_ZONE.name}
              </h3>
              <MapPin className="w-5 h-5" style={{ color: "#999999" }} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="ui-label">Active Workers</p>
                <p
                  className="ui-data"
                  style={{
                    fontSize: "1.4375rem",
                    marginTop: "4px",
                    fontWeight: 700,
                  }}
                >
                  {MANAGER_ZONE.active_workers}
                </p>
              </div>
              <div>
                <p className="ui-label">Risk Score</p>
                <p
                  className="ui-data"
                  style={{
                    fontSize: "1.4375rem",
                    marginTop: "4px",
                    fontWeight: 700,
                    color: getScoreColor(MANAGER_ZONE.composite_score),
                  }}
                >
                  {(MANAGER_ZONE.composite_score * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="ui-label">Composite Score</p>
                <span
                  className="ui-label"
                  style={{ color: getScoreColor(MANAGER_ZONE.composite_score) }}
                >
                  {MANAGER_ZONE.composite_score < 0.4
                    ? "LOW"
                    : MANAGER_ZONE.composite_score < 0.65
                      ? "MEDIUM"
                      : "HIGH"}
                </span>
              </div>
              <div
                className="w-full h-2"
                style={{ backgroundColor: "#e8e8e8", borderRadius: "9999px" }}
              >
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${MANAGER_ZONE.composite_score * 100}%`,
                    backgroundColor: getScoreColor(
                      MANAGER_ZONE.composite_score,
                    ),
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              {MANAGER_ZONE.last_trigger && (
                <div className="flex items-center justify-between ui-text">
                  <span style={{ color: "#666666" }}>Last Trigger:</span>
                  <span style={{ color: "#000000" }}>
                    {MANAGER_ZONE.last_trigger.type} ·{" "}
                    {MANAGER_ZONE.last_trigger.time}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between ui-text">
                <span style={{ color: "#666666" }}>Pending Flags:</span>
                <span style={{ color: "#000000" }}>
                  {MANAGER_ZONE.pending_flags}
                </span>
              </div>
              <div className="flex items-center justify-between ui-text">
                <span style={{ color: "#666666" }}>Active Payouts:</span>
                <span style={{ color: "#000000" }}>
                  {MANAGER_ZONE.active_payouts}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Live Zone Map and Trigger Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Live Zone Map */}
          <ManagerZoneMap />

          {/* Trigger Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-lg"
            style={{
              border: "1px solid #e8e8e8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h2
              className="font-display mb-4"
              style={{
                fontSize: "1.6875rem",
                fontWeight: 700,
                color: "#000000",
              }}
            >
              Recent Trigger Events
            </h2>
            <div className="space-y-4">
              {MOCK_TRIGGERS.map((trigger) => (
                <div
                  key={trigger.id}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-display"
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "#000000",
                      }}
                    >
                      {trigger.trigger_type.toUpperCase()}
                    </span>
                    <span
                      className="ui-label px-3 py-1 rounded"
                      style={{ backgroundColor: "#A55F4F", color: "#ffffff" }}
                    >
                      {trigger.severity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 ui-text">
                    <div>
                      <span style={{ color: "#666666" }}>
                        Workers Affected:
                      </span>
                      <span
                        style={{
                          color: "#000000",
                          marginLeft: "8px",
                          fontWeight: 600,
                        }}
                      >
                        {trigger.workers_affected}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#666666" }}>Total Payout:</span>
                      <span
                        style={{
                          color: "#7A9F8C",
                          marginLeft: "8px",
                          fontWeight: 600,
                        }}
                      >
                        ₹{trigger.total_payout.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#666666" }}>Fraud Holds:</span>
                      <span
                        style={{
                          color: "#A55F4F",
                          marginLeft: "8px",
                          fontWeight: 600,
                        }}
                      >
                        {trigger.fraud_holds}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#666666" }}>Time:</span>
                      <span
                        style={{
                          color: "#000000",
                          marginLeft: "8px",
                          fontWeight: 600,
                        }}
                      >
                        {new Date(trigger.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Worker Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg"
          style={{
            border: "1px solid #e8e8e8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            className="font-display mb-4"
            style={{ fontSize: "1.6875rem", fontWeight: 700, color: "#000000" }}
          >
            Worker Activity Feed
          </h2>
          <div className="space-y-4">
            {workerFeed.map((worker) => (
              <div
                key={worker.id}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #e8e8e8",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          worker.status === "online" ? "#7A9F8C" : "#cccccc",
                      }}
                    ></div>
                    <div>
                      <p className="ui-data">{worker.worker_name}</p>
                      <p
                        className="ui-text"
                        style={{ color: "#666666", marginTop: "2px" }}
                      >
                        ID: {worker.worker_id} · {worker.zone_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {worker.status === "online" ? (
                        <Wifi
                          className="w-4 h-4"
                          style={{ color: "#7A9F8C" }}
                        />
                      ) : (
                        <WifiOff
                          className="w-4 h-4"
                          style={{ color: "#cccccc" }}
                        />
                      )}
                      <span
                        className="ui-label"
                        style={{
                          color:
                            worker.status === "online" ? "#7A9F8C" : "#999999",
                        }}
                      >
                        {worker.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-4 ui-text">
                  <div>
                    <span style={{ color: "#666666" }}>Income Today:</span>
                    <span
                      style={{
                        color: "#000000",
                        marginLeft: "4px",
                        fontWeight: 600,
                      }}
                    >
                      ₹{worker.income_today}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#666666" }}>Orders:</span>
                    <span
                      style={{
                        color: "#000000",
                        marginLeft: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {worker.orders_today}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#666666" }}>Risk Score:</span>
                    <span
                      style={{
                        color: getRiskColor(worker.fraud_risk_score),
                        marginLeft: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {(worker.fraud_risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#666666" }}>Policy:</span>
                    <span
                      style={{
                        color: getPolicyColor(worker.policy_status),
                        marginLeft: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {worker.policy_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
