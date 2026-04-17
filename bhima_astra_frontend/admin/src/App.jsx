import { Navigate, Outlet, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom'

import Sidebar from './components/Sidebar'

import AnalyticsPage from './pages/Analytics/AnalyticsPage'
import DisruptionsPage from './pages/Disruptions/DisruptionsPage'
import PayoutsPage from './pages/Payouts/PayoutsPage'
import AstraThinks from './pages/Fraud/AstraThinks'
import CommandCenter from './pages/Admin/CommandCenter'
import LiveTriggers from './pages/Admin/LiveTriggers'

function AdminLayout() {
  const location = useLocation()
  const isFraud = location.pathname.startsWith('/admin/fraud')

  return (
    <div className={isFraud ? 'relative min-h-screen overflow-hidden' : 'relative min-h-screen bg-[#F5F5F5] text-[#111111]'}>
      <Sidebar theme={isFraud ? 'light' : 'dark'} />
      <main className={isFraud ? 'relative ml-[220px] min-h-screen' : 'relative ml-[220px] min-h-screen px-6 py-8'}>
        {isFraud ? (
          <Outlet />
        ) : (
          <div className="mx-auto w-full max-w-[1200px]">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  )
}

function FraudWorkerRoute() {
  const params = useParams()
  const [searchParams] = useSearchParams()

  const injected = {
    worker_id: params.worker_id ?? '',
    trigger_id: searchParams.get('trigger_id') ?? '',
    zone: searchParams.get('zone') ?? '',
    trigger_type: searchParams.get('trigger_type') ?? '',
    severity: searchParams.get('severity') ?? '',
    payout_status: searchParams.get('payout_status') ?? '',
  }

  return <AstraThinks injected={injected} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<CommandCenter />} />
        <Route path="live-triggers" element={<LiveTriggers />} />
        <Route path="disruptions" element={<DisruptionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="payouts" element={<PayoutsPage />} />
        <Route path="fraud/:worker_id" element={<FraudWorkerRoute />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
