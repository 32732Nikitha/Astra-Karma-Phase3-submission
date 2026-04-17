import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { ArrowLeft, AlertTriangle, Download } from "lucide-react";

interface DisruptionFlag {
  id: string;
  zone_id: string;
  disruption_type: "curfew" | "strike" | "road_blockage" | "protests";
  description: string;
  evidence_url: string;
  estimated_start: string;
  estimated_end: string;
  status: "pending" | "approved" | "rejected";
  affected_routes: string[];
  created_at: string;
  coordinates?: [number, number][];
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  workers_with_alternatives?: string[];
  workers_without_alternatives?: string[];
  affected_workers_count?: number;
  affected_workers_details?: Array<{
    worker_id: string;
    worker_name: string;
    status: string;
    route_name: string;
  }>;
  payout_flag_requests?: Array<{
    worker_id: string;
    worker_name: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
  }>;
}

const FlagHistory: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const mockFlags: DisruptionFlag[] = [
    {
      id: "disruption-1",
      zone_id: "MUM-WEST-01",
      disruption_type: "road_blockage",
      description: "NH8 blocked due to protest near Andheri flyover",
      evidence_url: "https://example.com/evidence1.jpg",
      estimated_start: "2026-04-15T13:30:00Z",
      estimated_end: "2026-04-15T18:30:00Z",
      status: "pending",
      affected_routes: ["route-2", "route-3", "route-5"],
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      workers_without_alternatives: ["Priya Sharma"],
      affected_workers_count: 1,
    },
    {
      id: "disruption-2",
      zone_id: "MUM-EAST-02",
      disruption_type: "strike",
      description: "Local market vendors on strike affecting delivery access",
      evidence_url: "https://example.com/evidence2.jpg",
      estimated_start: "2026-04-14T10:00:00Z",
      estimated_end: "2026-04-14T16:00:00Z",
      status: "approved",
      affected_routes: ["route-1", "route-4"],
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      verified_by: "admin@bhima-astra.com",
      verified_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      workers_without_alternatives: ["Amit Patel", "Raj Kumar"],
      affected_workers_count: 2,
    },
    {
      id: "disruption-3",
      zone_id: "MUM-CNTRL-03",
      disruption_type: "curfew",
      description: "Local curfew declared by municipal authorities",
      evidence_url: "https://example.com/evidence3.jpg",
      estimated_start: "2026-04-13T20:00:00Z",
      estimated_end: "2026-04-14T06:00:00Z",
      status: "rejected",
      affected_routes: ["route-6"],
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      verified_by: "admin@bhima-astra.com",
      verified_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      rejection_reason: "Insufficient evidence provided",
      workers_without_alternatives: [],
      affected_workers_count: 0,
    },
  ];

  const [flags, setFlags] = useState<DisruptionFlag[]>(() => {
    try {
      const stored = localStorage.getItem("disruptionFlags");
      if (stored) {
        return [...JSON.parse(stored), ...mockFlags];
      }
    } catch (e) {
      console.error("Error loading disruptions:", e);
    }
    return mockFlags;
  });

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [filteredFlags, setFilteredFlags] = useState<DisruptionFlag[]>(flags);

  useEffect(() => {
    let filtered = flags;
    if (statusFilter !== "all") {
      filtered = filtered.filter((flag) => flag.status === statusFilter);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((flag) => flag.disruption_type === typeFilter);
    }
    setFilteredFlags(filtered);
  }, [flags, statusFilter, typeFilter]);

  const getStatusBg = (status: string): string => {
    switch (status) {
      case "pending":
        return "#E8DCC4";
      case "approved":
        return "#D4E8D9";
      case "rejected":
        return "#E8D4CC";
      default:
        return "#f0f0f0";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "#8B7355";
      case "approved":
        return "#5F7A6B";
      case "rejected":
        return "#8B5F52";
      default:
        return "#666666";
    }
  };

  const getTypeLabel = (type: string): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleDownload = () => {
    if (filteredFlags.length === 0) {
      console.warn("No flags to download");
      return;
    }

    // Create CSV header
    const headers = ["ID", "Zone", "Type", "Description", "Status", "Created At", "Affected Workers", "Routes"];
    
    // Create CSV rows
    const rows = filteredFlags.map((flag) => [
      flag.id,
      flag.zone_id,
      getTypeLabel(flag.disruption_type),
      flag.description,
      flag.status,
      new Date(flag.created_at).toLocaleString("en-IN"),
      flag.affected_workers_count || 0,
      flag.affected_routes.join("; "),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `flag-history-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f8f8" }}>
      {/* Header */}
      <header
        className="bg-white"
        style={{ borderBottom: "1px solid #e8e8e8" }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate("/manager/dashboard")}
                className="ui-text transition-colors"
                whileHover={{ x: -5 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                BACK TO DASHBOARD
              </motion.button>
              <div
                className="w-8 h-8"
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertTriangle
                  className="w-5 h-5"
                  style={{ color: "#ffffff" }}
                />
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
                  Flag History
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="ui-text" style={{ color: "#666666" }}>
                {new Date().toLocaleString("en-IN")}
              </div>
              <button 
                onClick={handleDownload}
                className="ui-text"
                title="Download flag history as CSV"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="mb-8">
          <div className="ui-label mb-2">Flag Management</div>
          <h1
            className="font-display mb-4"
            style={{ fontSize: "1.9375rem", color: "#000000" }}
          >
            Disruption Flag History
          </h1>
          <p className="ui-text" style={{ color: "#666666" }}>
            Track all submitted flags and their verification status
          </p>
        </div>

        {/* Filters */}
        <div
          className="bg-white p-6 rounded-lg mb-6"
          style={{
            border: "1px solid #e8e8e8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block ui-label mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white rounded-lg focus:outline-none font-medium ui-text"
                style={{ border: "1px solid #e8e8e8", color: "#333333" }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block ui-label mb-2">Disruption Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white rounded-lg focus:outline-none font-medium ui-text"
                style={{ border: "1px solid #e8e8e8", color: "#333333" }}
              >
                <option value="all">All Types</option>
                <option value="curfew">Curfew</option>
                <option value="strike">Strike</option>
                <option value="road_blockage">Road Blockage</option>
                <option value="protests">Protests</option>
              </select>
            </div>

            {/* Results Count */}
            <div>
              <label className="block ui-label mb-2">Results</label>
              <div
                className="px-4 py-2 bg-white rounded-lg"
                style={{ border: "1px solid #e8e8e8" }}
              >
                <span className="ui-data">{filteredFlags.length} flags</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flag Cards */}
        <div className="space-y-6">
          {filteredFlags.map((flag, index) => {
            const isExpanded = expandedId === flag.id;
            return (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg"
                style={{
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p
                      className="font-display"
                      style={{
                        fontSize: "1.3125rem",
                        fontWeight: 700,
                        color: "#000000",
                      }}
                    >
                      {getTypeLabel(flag.disruption_type)}
                    </p>
                    <p
                      className="ui-text"
                      style={{ color: "#666666", marginTop: 4 }}
                    >
                      {new Date(flag.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="ui-label px-3 py-2 rounded"
                      style={{
                        backgroundColor: getStatusBg(flag.status),
                        color: getStatusColor(flag.status),
                      }}
                    >
                      {flag.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : flag.id)}
                      className="ui-label px-3 py-2 rounded"
                      style={{
                        backgroundColor: "#f0f0f0",
                        color: "#333333",
                        cursor: "pointer",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                <p
                  className="ui-text"
                  style={{ color: "#333333", marginBottom: 12 }}
                >
                  {flag.description}
                </p>

                {/* Affected Routes */}
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <h3
                    className="font-display"
                    style={{
                      fontSize: "1.0625rem",
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#000000",
                    }}
                  >
                    AFFECTED ROUTES & WORKERS
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between ui-text">
                      <span style={{ color: "#666666" }}>Zone:</span>
                      <span style={{ color: "#000000", fontWeight: 500 }}>
                        {flag.zone_id}
                      </span>
                    </div>
                    <div className="flex justify-between ui-text">
                      <span style={{ color: "#666666" }}>Routes Affected:</span>
                      <span style={{ color: "#000000", fontWeight: 500 }}>
                        {flag.affected_routes.length}
                      </span>
                    </div>
                    <div className="flex justify-between ui-text">
                      <span style={{ color: "#666666" }}>Route Names:</span>
                      <span style={{ color: "#000000", fontWeight: 500 }}>
                        {flag.affected_routes.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <>
                    {/* Workers Summary */}
                    {(flag.workers_with_alternatives ||
                      flag.workers_without_alternatives) && (
                      <div
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: "#f5f5f5",
                          border: "1px solid #e8e8e8",
                          marginTop: 12,
                        }}
                      >
                        <h3
                          className="font-display"
                          style={{
                            fontSize: "1.0625rem",
                            fontWeight: 700,
                            marginBottom: 8,
                            color: "#000000",
                          }}
                        >
                          WORKERS IMPACT ANALYSIS
                        </h3>
                        <div className="space-y-3">
                          {flag.workers_without_alternatives &&
                            flag.workers_without_alternatives.length > 0 && (
                              <div>
                                <div
                                  className="ui-label mb-2"
                                  style={{ color: "#8B5F52" }}
                                >
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: "12px",
                                      height: "12px",
                                      borderRadius: "50%",
                                      backgroundColor: "#DC2626",
                                      marginRight: "8px",
                                      verticalAlign: "middle",
                                    }}
                                  ></span>
                                  Workers Needing Payout (No Alternative
                                  Routes):
                                </div>
                                <div className="space-y-2 pl-4 border-l-2 border-red-400">
                                  {flag.affected_workers_details
                                    ?.filter((w) =>
                                      flag.workers_without_alternatives!.includes(
                                        w.worker_name,
                                      ),
                                    )
                                    .map((worker) => (
                                      <div
                                        key={worker.worker_id}
                                        className="ui-text"
                                        style={{ color: "#333333" }}
                                      >
                                        <strong>{worker.worker_name}</strong>{" "}
                                        (ID: {worker.worker_id})<br />
                                        <span
                                          style={{
                                            fontSize: "0.85rem",
                                            color: "#666666",
                                          }}
                                        >
                                          Route: {worker.route_name} | Status:{" "}
                                          {worker.status}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          {flag.workers_with_alternatives &&
                            flag.workers_with_alternatives.length > 0 && (
                              <div>
                                <div
                                  className="ui-label mb-2"
                                  style={{ color: "#5F7A6B" }}
                                >
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: "12px",
                                      height: "12px",
                                      borderRadius: "50%",
                                      backgroundColor: "#10B981",
                                      marginRight: "8px",
                                      verticalAlign: "middle",
                                    }}
                                  ></span>
                                  Workers with Alternative Routes (No Payout):
                                </div>
                                <div className="space-y-1 pl-4 border-l-2 border-green-400">
                                  {flag.workers_with_alternatives.map(
                                    (workerName) => (
                                      <div
                                        key={workerName}
                                        className="ui-text"
                                        style={{ color: "#333333" }}
                                      >
                                        {workerName}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Payout Flag Requests */}
                    {flag.payout_flag_requests &&
                      flag.payout_flag_requests.length > 0 && (
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            backgroundColor: "#fff5f5",
                            border: "1px solid #f5d4c8",
                            marginTop: 12,
                          }}
                        >
                          <h3
                            className="font-display"
                            style={{
                              fontSize: "1.0625rem",
                              fontWeight: 700,
                              marginBottom: 8,
                              color: "#8B5F52",
                            }}
                          >
                            PAYOUT FLAG REQUESTS (
                            {flag.payout_flag_requests.length})
                          </h3>
                          <div className="space-y-3">
                            {flag.payout_flag_requests.map((request, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded"
                                style={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #e8d4c8",
                                }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div
                                      className="ui-data"
                                      style={{ color: "#000000" }}
                                    >
                                      {request.worker_name}
                                    </div>
                                    <div
                                      className="ui-label"
                                      style={{ color: "#666666", marginTop: 2 }}
                                    >
                                      ID: {request.worker_id}
                                    </div>
                                  </div>
                                  <span
                                    className="ui-label px-2 py-1 rounded"
                                    style={{
                                      backgroundColor:
                                        request.status === "approved"
                                          ? "#D4E8D9"
                                          : "#E8DCC4",
                                      color:
                                        request.status === "approved"
                                          ? "#5F7A6B"
                                          : "#8B7355",
                                    }}
                                  >
                                    {request.status.toUpperCase()}
                                  </span>
                                </div>
                                <div
                                  className="ui-text"
                                  style={{
                                    color: "#333333",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {request.reason}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredFlags.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "#cccccc" }}
            />
            <h3
              className="font-display mb-2"
              style={{
                fontSize: "1.4375rem",
                fontWeight: 700,
                color: "#000000",
              }}
            >
              No Flags Found
            </h3>
            <p className="ui-text" style={{ color: "#666666" }}>
              {statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters to see more results."
                : "No disruption flags have been submitted yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlagHistory;
