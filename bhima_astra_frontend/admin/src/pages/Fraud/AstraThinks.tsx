import { useEffect, useRef, useCallback } from 'react';

import { motion } from 'framer-motion';

import '../../styles/bhima-astra.css';
import 'maplibre-gl/dist/maplibre-gl.css';

import { WORKERS } from '../../lib/data';
import { useSimulation } from '../../hooks/use-simulation';
import { Nav } from '../../components/bhima/nav';
import { Pipeline } from '../../components/bhima/pipeline';
import { WorkerCard } from '../../components/bhima/worker-card';
import { RulesCard } from '../../components/bhima/rules-card';
import { OracleCard } from '../../components/bhima/oracle-card';
import { Terminal } from '../../components/bhima/terminal';
import { BehavioralCard } from '../../components/bhima/behavioral-card';
import { GraphFraudCard } from '../../components/bhima/graph-fraud-card';
import { DecisionModal } from '../../components/bhima/decision-modal';
import { Footer } from '../../components/bhima/footer';
import { AstraNeuralVisual } from '../../components/bhima/astra-neural-visual';
import { TriggerAlertBanner } from '../../components/bhima/trigger-alert-banner';
import { PayoutCard } from '../../components/bhima/payout-card';
import { IncomeModelCard } from '../../components/bhima/income-model-card';
import { PremiumModelCard } from '../../components/bhima/premium-model-card';

type InjectedTriggerContext = {
  worker_id: string;
  trigger_id: string;
  zone: string;
  trigger_type: string;
  severity: string;
  payout_status: string;
};

type AstraThinksProps =
  | {
      injected?: InjectedTriggerContext;
    }
  | (Partial<Omit<InjectedTriggerContext, 'trigger_id'>> & {
      injected?: InjectedTriggerContext;
      trigger_id?: string;
    });

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function BhimaAstra(props: AstraThinksProps) {
  const injected: InjectedTriggerContext | undefined =
    (props as any)?.injected ??
    (props &&
    (props as any).worker_id
      ? {
          worker_id: String((props as any).worker_id ?? ''),
          trigger_id: String((props as any).trigger_id ?? ''),
          zone: String((props as any).zone ?? ''),
          trigger_type: String((props as any).trigger_type ?? ''),
          severity: String((props as any).severity ?? ''),
          payout_status: String((props as any).payout_status ?? ''),
        }
      : undefined);

  const { state, currentWorker, motionTrace, latency, runSimulation, resetAll, onWorkerChange, closeModal } = useSimulation();

  // --- CHANGE 5 & 6: Queue-based delayed processing ---
  const triggerQueueRef = useRef<InjectedTriggerContext[]>([]);
  const isProcessingRef = useRef(false);
  const prevInjectedRef = useRef<InjectedTriggerContext | null>(null);

  // --- CHANGE 7: Dynamic worker mapping from trigger ---
  const resolveWorkerIdx = useCallback((workerId: string) => {
    const idx = WORKERS.findIndex((w) => w.id === workerId);
    return idx >= 0 ? idx : 0;
  }, []);

  const processNextTrigger = useCallback(() => {
    if (isProcessingRef.current) return;
    if (triggerQueueRef.current.length === 0) return;

    isProcessingRef.current = true;
    const trigger = triggerQueueRef.current.shift()!;

    // CHANGE 7: Select correct worker from trigger.worker_id
    const workerIdx = resolveWorkerIdx(trigger.worker_id);
    onWorkerChange(workerIdx);

    // Small settle delay then run simulation
    setTimeout(() => {
      runSimulation();

      // After simulation starts, schedule next trigger with 5–10s delay
      const delay = 5000 + Math.random() * 5000;
      setTimeout(() => {
        isProcessingRef.current = false;
        processNextTrigger();
      }, delay);
    }, 300);
  }, [resolveWorkerIdx, onWorkerChange, runSimulation]);

  // --- CHANGE 3 & 6: React to incoming injected trigger automatically ---
  useEffect(() => {
    if (!injected?.trigger_id) return;

    const isSame =
      prevInjectedRef.current?.trigger_id === injected.trigger_id &&
      prevInjectedRef.current?.worker_id === injected.worker_id;

    if (isSame) return;

    prevInjectedRef.current = injected;

    // Enqueue the new trigger
    triggerQueueRef.current.push(injected);

    // Kick off processing if not already running
    processNextTrigger();
  }, [injected, processNextTrigger]);

  // no-op effect retained previously for Three.js warnings; removed for strict stack

  // --- CHANGE 7: Always derive displayWorker from injected trigger ---
  const displayWorker = injected?.worker_id
    ? {
        ...currentWorker,
        id: injected.worker_id,
        city: injected.zone || currentWorker.city,
        zone: injected.zone || currentWorker.zone,
      }
    : currentWorker;

  const displayEvent = injected?.trigger_id
    ? (state.currentEvent
        ? {
            ...state.currentEvent,
            id: injected.trigger_id || state.currentEvent.id,
            trigger: injected.trigger_type || state.currentEvent.trigger,
            label: injected.severity ? `${state.currentEvent.label} · ${injected.severity}` : state.currentEvent.label,
          }
        : {
            id: injected.trigger_id,
            day: 0,
            hour: 0,
            rainfall: 0,
            aqi: 0,
            traffic: 0,
            composite: 0,
            label: injected.severity ? `External trigger · ${injected.severity}` : 'External trigger',
            trigger: injected.trigger_type || 'fraud',
            flood_alert: 0,
            road_closure: 0,
          })
    : state.currentEvent;

  return (
    <div className="bhima-app">
      <Nav />

      {/* HERO SECTION */}
      <motion.section
        className="hero max-w-[1440px] mx-auto px-8 min-h-[70vh] flex items-center"
        id="home"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="hero-split">

          {/* Left Side: Astra Thinks Text */}
          <div className="z-10">
            <motion.div className="hero-eyebrow" variants={fadeUp}>AI-Powered Risk Assessment</motion.div>
            <motion.h1 className="hero-title" variants={fadeUp}>
              Astra<br /><em>Thinks.</em>
            </motion.h1>
            <motion.p className="hero-sub" variants={fadeUp}>
              Real-time parametric insurance &amp; fraud detection.<br />
              Watch the pipeline make decisions — live.
            </motion.p>
            {/* CHANGE 1 & 4: Removed Run Simulation button and worker dropdown */}
            {/* CHANGE 2: StatsBand removed below — no replacement */}
          </div>

          {/* Right Side: The Map */}
          <motion.div
            variants={fadeUp}
            className="hero-visual"
          >
            <div className="hero-visual-inner">
              <AstraNeuralVisual isRunning={state.isRunning} />
            </div>
          </motion.div>

        </div>
      </motion.section>

      {/* CHANGE 2: StatsBand intentionally removed */}

      <TriggerAlertBanner
        visible={state.showTriggerBanner}
        headline={state.triggerHeadline}
        subline={state.triggerSubline}
      />
      <Pipeline stages={state.pipelineStages} />
      <section className="worker-section">
        <div className="worker-grid">
          <WorkerCard worker={displayWorker} />
          <RulesCard ruleResult={state.ruleResult} />
        </div>
      </section>
      <section className="worker-section" style={{ paddingTop: 0 }}>
        <div className="worker-grid">
          <IncomeModelCard result={state.incomeModelResult} isActive={state.isRunning && state.pipelineStages[0] === 'running'} />
          <PremiumModelCard result={state.premiumModelResult} isActive={state.isRunning && state.pipelineStages[0] === 'running'} />
        </div>
      </section>
      <section className="sim-core" id="oracle">
        <div className="sim-three-col">
          <OracleCard event={displayEvent} gauges={state.gauges} isRunning={state.isRunning} />
          <Terminal logs={state.logs} eventId={displayEvent?.id || '—'} />
          <BehavioralCard behaviorResult={state.behaviorResult} motionTrace={motionTrace} gpsDelta={displayWorker.features.gps_tower_delta} />
        </div>
        <div className="mt-3 flex flex-col gap-3">
          <GraphFraudCard
            graphResult={state.graphFraudResult}
            clusterScore={displayWorker.graph.fraud_cluster_score}
            isGraphActive={state.isRunning && state.pipelineStages[3] === 'running'}
          />
          <PayoutCard phase={state.payoutPhase} amount={state.payoutAmount} upiRef={state.payoutUpiRef} />
        </div>
      </section>
      <DecisionModal isOpen={state.showModal} onClose={closeModal} decisionResult={state.decisionResult} featureImportance={state.featureImportance} worker={displayWorker} />
      <Footer />
    </div>
  );
}