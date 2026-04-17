// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { 
//   AlertTriangle, 
//   ArrowLeft, 
//   CheckCircle, 
//   XCircle, 
//   Clock, 
//   Users, 
//   DollarSign, 
//   MapPin,
//   Filter,
//   Download,
//   Eye,
//   ExternalLink
// } from 'lucide-react';

// interface DisruptionFlag {
//   id: number;
//   manager_id: number;
//   zone_id: string;
//   disruption_type: 'curfew' | 'strike' | 'road_blockage' | 'zone_shutdown';
//   description: string;
//   evidence_url: string;
//   flagged_at: string;
//   route_feasible: boolean;
//   route_check_result: string;
//   workers_in_zone: number;
//   estimated_payout: number;
//   flag_status: 'pending' | 'verified' | 'rejected';
//   verified_by?: number;
//   verified_at?: string;
//   payout_enabled: boolean;
//   affected_workers: number[];
// }

// const FlagHistory: React.FC = () => {
//   const navigate = useNavigate();
//   const [flags, setFlags] = useState<DisruptionFlag[]>([]);
//   const [filteredFlags, setFilteredFlags] = useState<DisruptionFlag[]>([]);
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
//   const [typeFilter, setTypeFilter] = useState<'all' | 'curfew' | 'strike' | 'road_blockage' | 'zone_shutdown'>('all');

//   // Mock data
//   useEffect(() => {
//     const mockFlags: DisruptionFlag[] = [
//       {
//         id: 1,
//         manager_id: 5,
//         zone_id: 'MUM-WEST-01',
//         disruption_type: 'road_blockage',
//         description: 'NH8 blocked near Andheri flyover due to protest',
//         evidence_url: 'https://example.com/photo1.jpg',
//         flagged_at: '2026-04-15T10:30:00Z',
//         route_feasible: false,
//         route_check_result: 'No viable route found to zone center. 3 alternate routes blocked.',
//         workers_in_zone: 67,
//         estimated_payout: 40200,
//         flag_status: 'pending',
//         payout_enabled: false,
//         affected_workers: [1024, 1025, 1026, 1027, 1028]
//       },
//       {
//         id: 2,
//         manager_id: 5,
//         zone_id: 'MUM-EAST-02',
//         disruption_type: 'strike',
//         description: 'Local market vendors on strike affecting delivery routes',
//         evidence_url: 'https://example.com/news1.com',
//         flagged_at: '2026-04-15T08:15:00Z',
//         route_feasible: false,
//         route_check_result: 'No viable route found. Market access blocked.',
//         workers_in_zone: 45,
//         estimated_payout: 22500,
//         flag_status: 'verified',
//         verified_by: 1,
//         verified_at: '2026-04-15T09:45:00Z',
//         payout_enabled: true,
//         affected_workers: [1029, 1030, 1031]
//       },
//       {
//         id: 3,
//         manager_id: 6,
//         zone_id: 'MUM-CNTRL-03',
//         disruption_type: 'curfew',
//         description: 'Section 144 imposed in central area after 10 PM',
//         evidence_url: 'https://example.com/notice1.pdf',
//         flagged_at: '2026-04-14T22:00:00Z',
//         route_feasible: true,
//         route_check_result: 'Route available via alternate roads. Curfew doesn\'t affect delivery.',
//         workers_in_zone: 89,
//         estimated_payout: 0,
//         flag_status: 'rejected',
//         verified_by: 1,
//         verified_at: '2026-04-14T23:30:00Z',
//         payout_enabled: false,
//         affected_workers: []
//       },
//       {
//         id: 4,
//         manager_id: 5,
//         zone_id: 'MUM-WEST-01',
//         disruption_type: 'zone_shutdown',
//         description: 'Commercial complex closed for maintenance',
//         evidence_url: 'https://example.com/notice2.jpg',
//         flagged_at: '2026-04-14T14:20:00Z',
//         route_feasible: false,
//         route_check_result: 'Main access point closed. No alternative routes.',
//         workers_in_zone: 67,
//         estimated_payout: 35000,
//         flag_status: 'verified',
//         verified_by: 1,
//         verified_at: '2026-04-14T15:00:00Z',
//         payout_enabled: true,
//         affected_workers: [1032, 1033, 1034]
//       }
//     ];
//     setFlags(mockFlags);
//     setFilteredFlags(mockFlags);
//   }, [statusFilter, typeFilter]);

//   // Filter flags
//   useEffect(() => {
//     let filtered = flags;

//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(flag => flag.flag_status === statusFilter);
//     }

//     if (typeFilter !== 'all') {
//       filtered = filtered.filter(flag => flag.disruption_type === typeFilter);
//     }

//     setFilteredFlags(filtered);
//   }, [flags, statusFilter, typeFilter]);

//   const getStatusColor = (status: string): string => {
//   switch (status) {
//     case 'pending': return 'text-yellow-400';
//     case 'verified': return 'text-green-600';
//     case 'rejected': return 'text-red-600';
//     default: return 'text-gray-600';
//   }
// };

//   const getStatusBg = (status: string): string => {
//     switch (status) {
//       case 'pending': return 'bg-yellow-100 border-yellow-200';
//       case 'verified': return 'bg-green-100 border-green-200';
//       case 'rejected': return 'bg-red-100 border-red-200';
//       default: return 'bg-gray-100 border-gray-200';
//     }
//   };

//   const getTypeLabel = (type: string): string => {
//     return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200">
//         <div className="px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <motion.button
//                 onClick={() => navigate('/manager/dashboard')}
//                 className="text-gray-600 hover:text-gray-900 transition-colors"
//                 whileHover={{ x: -5 }}
//               >
//                 <ArrowLeft className="w-5 h-5 mr-2" />
//                 Back to Dashboard
//               </motion.button>
//               <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
//                 <AlertTriangle className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">BHIMA ASTRA</h1>
//                 <p className="text-xs text-gray-600">Flag History</p>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="text-sm text-gray-600">
//                 {new Date().toLocaleString('en-IN')}
//               </div>
//               <button className="text-gray-600 hover:text-gray-900">
//                 <Download className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="px-6 py-8">
//         <div className="mb-8">
//           <div className="text-sm font-medium text-gray-600 mb-2">Flag Management</div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">Disruption Flag History</h1>
//           <p className="text-gray-600">
//             Track all submitted flags, their verification status, and payout outcomes
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Status Filter */}
//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as any)}
//                 className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-500 font-medium"
//               >
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="verified">Verified</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>

//             {/* Type Filter */}
//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Disruption Type</label>
//               <select
//                 value={typeFilter}
//                 onChange={(e) => setTypeFilter(e.target.value as any)}
//                 className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-500 font-medium"
//               >
//                 <option value="all">All Types</option>
//                 <option value="curfew">Curfew</option>
//                 <option value="strike">Strike</option>
//                 <option value="road_blockage">Road Blockage</option>
//                 <option value="zone_shutdown">Zone Shutdown</option>
//               </select>
//             </div>

//             {/* Results Count */}
//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Results</label>
//               <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
//                 <span className="text-gray-900 font-medium">{filteredFlags.length} flags</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Flag Cards */}
//         {/* Flag Cards */}
// <div className="space-y-6">
//   {filteredFlags.length > 0 ? (
//     filteredFlags.map((flag, index) => (
//       <motion.div
//         key={flag.id}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: index * 0.1 }}
//         className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
//       >
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-gray-900 font-medium capitalize">
//             {getTypeLabel(flag.disruption_type)}
//           </span>
//           <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
//             L2
//           </span>
//         </div>
//       </motion.div>
//     ))
//   ) : (
//     <div className="text-center py-12">
//       <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//       <h3 className="text-xl font-bold text-gray-900 mb-2">
//         No Flags Found
//       </h3>
//       <p className="text-gray-600">
//         {statusFilter !== 'all' || typeFilter !== 'all'
//           ? 'Try adjusting your filters to see more results.'
//           : 'No disruption flags have been submitted yet.'}
//       </p>
//     </div>
//   )}
// </div>
// );
// };

// export default FlagHistory;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  ArrowLeft, 
  Download
} from 'lucide-react';

interface DisruptionFlag {
  id: number;
  manager_id: number;
  zone_id: string;
  disruption_type: 'curfew' | 'strike' | 'road_blockage' | 'zone_shutdown';
  description: string;
  evidence_url: string;
  flagged_at: string;
  route_feasible: boolean;
  route_check_result: string;
  workers_in_zone: number;
  estimated_payout: number;
  flag_status: 'pending' | 'verified' | 'rejected';
  verified_by?: number;
  verified_at?: string;
  payout_enabled: boolean;
  affected_workers: number[];
}

const FlagHistory: React.FC = () => {
  const navigate = useNavigate();
  const [flags, setFlags] = useState<DisruptionFlag[]>([]);
  const [filteredFlags, setFilteredFlags] = useState<DisruptionFlag[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'curfew' | 'strike' | 'road_blockage' | 'zone_shutdown'>('all');

  // Mock data
  useEffect(() => {
    const mockFlags: DisruptionFlag[] = [
      {
        id: 1,
        manager_id: 5,
        zone_id: 'MUM-WEST-01',
        disruption_type: 'road_blockage',
        description: 'NH8 blocked near Andheri flyover due to protest',
        evidence_url: 'https://example.com/photo1.jpg',
        flagged_at: '2026-04-15T10:30:00Z',
        route_feasible: false,
        route_check_result: 'No viable route found to zone center. 3 alternate routes blocked.',
        workers_in_zone: 67,
        estimated_payout: 40200,
        flag_status: 'pending',
        payout_enabled: false,
        affected_workers: [1024, 1025, 1026, 1027, 1028]
      },
      {
        id: 2,
        manager_id: 5,
        zone_id: 'MUM-EAST-02',
        disruption_type: 'strike',
        description: 'Local market vendors on strike affecting delivery routes',
        evidence_url: 'https://example.com/news1.com',
        flagged_at: '2026-04-15T08:15:00Z',
        route_feasible: false,
        route_check_result: 'No viable route found. Market access blocked.',
        workers_in_zone: 45,
        estimated_payout: 22500,
        flag_status: 'verified',
        verified_by: 1,
        verified_at: '2026-04-15T09:45:00Z',
        payout_enabled: true,
        affected_workers: [1029, 1030, 1031]
      },
      {
        id: 3,
        manager_id: 6,
        zone_id: 'MUM-CNTRL-03',
        disruption_type: 'curfew',
        description: 'Section 144 imposed in central area after 10 PM',
        evidence_url: 'https://example.com/notice1.pdf',
        flagged_at: '2026-04-14T22:00:00Z',
        route_feasible: true,
        route_check_result: 'Route available via alternate roads. Curfew doesn\'t affect delivery.',
        workers_in_zone: 89,
        estimated_payout: 0,
        flag_status: 'rejected',
        verified_by: 1,
        verified_at: '2026-04-14T23:30:00Z',
        payout_enabled: false,
        affected_workers: []
      },
      {
        id: 4,
        manager_id: 5,
        zone_id: 'MUM-WEST-01',
        disruption_type: 'zone_shutdown',
        description: 'Commercial complex closed for maintenance',
        evidence_url: 'https://example.com/notice2.jpg',
        flagged_at: '2026-04-14T14:20:00Z',
        route_feasible: false,
        route_check_result: 'Main access point closed. No alternative routes.',
        workers_in_zone: 67,
        estimated_payout: 35000,
        flag_status: 'verified',
        verified_by: 1,
        verified_at: '2026-04-14T15:00:00Z',
        payout_enabled: true,
        affected_workers: [1032, 1033, 1034]
      }
    ];
    setFlags(mockFlags);
    setFilteredFlags(mockFlags);
  }, []); // ✅ FIXED

  // Filter flags
  useEffect(() => {
    let filtered = flags;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(flag => flag.flag_status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(flag => flag.disruption_type === typeFilter);
    }

    setFilteredFlags(filtered);
  }, [flags, statusFilter, typeFilter]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'verified': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-200';
      case 'verified': return 'bg-green-100 border-green-200';
      case 'rejected': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getTypeLabel = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <motion.button
            onClick={() => navigate('/manager/dashboard')}
            whileHover={{ x: -5 }}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </motion.button>

          <div className="text-sm">{new Date().toLocaleString('en-IN')}</div>

          <Download className="w-5 h-5 text-gray-600" />
        </div>
      </header>

      <div className="p-6">
        <div className="space-y-6">
          {filteredFlags.length > 0 ? (
            filteredFlags.map((flag, index) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg border"
              >
                <div className="flex justify-between">
                  <span>{getTypeLabel(flag.disruption_type)}</span>
                  <span>{flag.flag_status}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto" />
              <p>No Flags Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlagHistory;