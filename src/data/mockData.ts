import type { IncidentEvent, ServiceStatus, Scenario } from '../types';

export const SYSTEM_METRICS = [
  { label: 'System Health', value: '99.98%', subtext: 'Nominal across 4 clusters' },
  { label: 'Active Services', value: '42', subtext: 'All running within SLO' },
  { label: 'Healthy Pods', value: '184 / 186', subtext: '2 scaling in progress' },
  { label: 'Incidents Detected', value: '14', subtext: 'Last 24 hours' },
  { label: 'Recovery Actions', value: '14 / 14', subtext: '100% automated resolution' },
  { label: 'MTTD', value: '1.4s', subtext: 'Mean time to detect' },
  { label: 'MTTR', value: '3.8s', subtext: 'Mean time to recover' },
  { label: 'Downtime Prevented', value: '48.5 hrs', subtext: 'Calculated vs manual SLA' },
];

export const INITIAL_INCIDENTS: IncidentEvent[] = [
  {
    id: 'INC-8941',
    timestamp: 'Just now',
    service: 'payment-gateway-svc',
    type: 'Pod Crash (OOMKilled)',
    status: 'recovered',
    action: 'Restart & Replace Pod',
    duration: '2.6s',
    details: 'Heap ceiling exceeded (2048MB). AutoHeal cordoned node, recycled container, and restored 100% healthy endpoint.'
  },
  {
    id: 'INC-8940',
    timestamp: '18 min ago',
    service: 'auth-session-worker',
    type: 'CPU Overload (94%)',
    status: 'recovered',
    action: 'Scale Replicas (4 → 10)',
    duration: '4.1s',
    details: 'Flash login traffic surge. AutoHeal horizontal autoscaler dispatched 6 additional replicas via HPA webhook.'
  },
  {
    id: 'INC-8939',
    timestamp: '1 hr ago',
    service: 'checkout-api-v2',
    type: 'Bad Deployment (500 Spikes)',
    status: 'recovered',
    action: 'Rollback Deployment (v2.4.1 → v2.4.0)',
    duration: '3.4s',
    details: 'Error rate hit 14.8% on canary release. AutoHeal detected anomaly, halted deployment, and reverted replica set to v2.4.0.'
  },
  {
    id: 'INC-8938',
    timestamp: '3 hrs ago',
    service: 'recommendation-cache',
    type: 'Network Partition & Ingress Latency',
    status: 'recovered',
    action: 'Reroute Traffic (Zone B → Zone A)',
    duration: '1.9s',
    details: 'Packet drop rate exceeded 12% in AZ-us-east-1b. Service mesh ingress weights instantly rerouted to healthy AZ-1a.'
  },
  {
    id: 'INC-8937',
    timestamp: '6 hrs ago',
    service: 'ledger-sync-daemon',
    type: 'Persistent Crash Loop (3x in 2m)',
    status: 'escalated',
    action: 'Circuit Breaker & Admin Alert',
    duration: '1.2s',
    details: 'Crash loop mitigation triggered. AutoHeal stopped recursive restarts, preserved core dump, and notified duty engineer.'
  }
];

export const CLUSTER_SERVICES: ServiceStatus[] = [
  { name: 'payment-gateway-svc', namespace: 'prod-fintech', replicas: '8/8', cpuUsage: '28%', memUsage: '62%', status: 'healthy', lastHealed: 'Just now' },
  { name: 'auth-session-worker', namespace: 'prod-core', replicas: '10/10', cpuUsage: '44%', memUsage: '58%', status: 'healthy', lastHealed: '18 min ago' },
  { name: 'checkout-api-v2', namespace: 'prod-commerce', replicas: '12/12', cpuUsage: '36%', memUsage: '51%', status: 'healthy', lastHealed: '1 hr ago' },
  { name: 'order-processing-queue', namespace: 'prod-commerce', replicas: '16/16', cpuUsage: '49%', memUsage: '64%', status: 'healthy', lastHealed: '2 days ago' },
  { name: 'inventory-data-sync', namespace: 'prod-data', replicas: '6/6', cpuUsage: '22%', memUsage: '47%', status: 'healthy', lastHealed: 'Yesterday' },
  { name: 'notification-dispatcher', namespace: 'prod-core', replicas: '4/4', cpuUsage: '18%', memUsage: '38%', status: 'healthy', lastHealed: '4 days ago' },
];

export const DEMO_SCENARIOS: Scenario[] = [
  {
    id: 'scenario-pod-crash',
    title: 'Pod Crash & Thread Deadlock',
    trigger: 'Container OOM or unhandled panic causes instant process death.',
    action: 'Restart / Replace Pod',
    mttd: '1.2s',
    mttr: '2.6s',
    flowDescription: 'Scrapes kubelet health metrics → Detects crash loop state → Evicts failed pod → Spawns verified replica → Confirms liveness probe.',
    details: [
      'Prometheus detects 0/1 ready state in 600ms',
      'Classified as Isolated Container Failure',
      'Automated actuator initiates graceful pod replacement',
      'Readiness probe passes; traffic restored with zero 502 errors'
    ]
  },
  {
    id: 'scenario-cpu-overload',
    title: 'CPU / Memory Saturation',
    trigger: 'Sudden traffic spike drives CPU above 90% causing latency degradation.',
    action: 'Scale Replicas',
    mttd: '1.8s',
    mttr: '4.1s',
    flowDescription: 'Ingests p99 latency & CPU telemetry → Predicts saturation cliff → Issues horizontal scale policy → Distributes load across 10 pods.',
    details: [
      'Detects CPU ceiling threshold breach at 90% for > 3s',
      'Classifies anomaly as Capacity Exhaustion',
      'Multi-pod scaling policy calculated (+6 target pods)',
      'Load balancer rebalances connections; latency drops back to 42ms'
    ]
  },
  {
    id: 'scenario-bad-deployment',
    title: 'Faulty Release & Broken Deployment',
    trigger: 'New version v2.4.1 introduced a silent database schema deadlock.',
    action: 'Rollback Deployment',
    mttd: '2.1s',
    mttr: '3.4s',
    flowDescription: 'Canary error rates spike past 5% → Rollback engine aborts rollout → Instantly switches routing back to proven v2.4.0 revision.',
    details: [
      'Synthetic probes catch 500 error spikes on canary pods',
      'Classified as Regression / Incompatible Release',
      'Autonomous rollback executed via Deployment revision history',
      'Service SLO preserved before widespread user impact'
    ]
  },
  {
    id: 'scenario-repeated-crash',
    title: 'Persistent Crash Loop & Circuit Breaker',
    trigger: 'Downstream third-party outage causes service to fail continuously.',
    action: 'Circuit Breaker & Admin Alert',
    mttd: '1.5s',
    mttr: '1.2s',
    flowDescription: 'Detects 3 successive crash attempts → Triggers anti-flapping circuit breaker → Isolates service → Dispatches diagnostic bundle to admin.',
    details: [
      'Safety engine detects recurring crash loop counter (N=3)',
      'Prevents cluster resource exhaustion and endless restarts',
      'Captures stack traces and environment logs automatically',
      'Alerts engineering team with actionable RCA payload'
    ]
  }
];

export const SOLUTION_STEPS = [
  {
    step: '01',
    name: 'Monitor',
    badge: 'Continuous Telemetry',
    summary: 'Collect high-frequency metrics and health signals',
    description: 'AutoHeal continuously ingests Prometheus metrics, cgroup telemetry, kubelet events, and synthetic probe health signals at sub-second intervals across every node and container.',
    signals: ['CPU & Memory usage', 'HTTP 5xx rate', 'p95/p99 Latency', 'Pod Liveness & Readiness', 'TCP packet drops']
  },
  {
    step: '02',
    name: 'Detect',
    badge: 'Real-time Detection',
    summary: 'Identify abnormal behaviour before customer impact',
    description: 'Deterministic anomaly detectors compare real-time telemetry against dynamic baseline models, identifying thread deadlocks, memory leaks, and saturation within 1.5 seconds.',
    signals: ['Threshold breaches', 'Rate-of-change spikes', 'Failed readiness probes', 'Crash loop backoff flags']
  },
  {
    step: '03',
    name: 'Classify',
    badge: 'Incident Categorization',
    summary: 'Understand the exact root type of failure',
    description: 'AutoHeal maps symptoms to failure patterns: distinguishing between an isolated pod crash, widespread resource saturation, faulty deployment rollouts, or network partition.',
    signals: ['OOM Kill vs Deadlock', 'Localized vs Cluster-wide', 'Configuration Drift', 'Canary Regression']
  },
  {
    step: '04',
    name: 'Decide',
    badge: 'Autonomous Policy',
    summary: 'Choose the optimal recovery action with safety bounds',
    description: 'The Decision Engine runs state-machine policies equipped with anti-flapping circuit breakers. It selects the least invasive, highest-confidence remediation action.',
    signals: ['Action cost matrix', 'Circuit breaker checks', 'Rate-limit safeguards', 'Deployment revision trees']
  },
  {
    step: '05',
    name: 'Recover',
    badge: 'Actuator Execution',
    summary: 'Execute self-healing: restart, scale, rollback, or reroute',
    description: 'Dispatches targeted commands directly to the Kubernetes orchestration plane and service mesh: replacing failed pods, scaling replicas, rolling back, or rerouting traffic.',
    signals: ['Pod eviction & replacement', 'HPA replica adjustments', 'Deployment revision rollback', 'Ingress weight shifts']
  },
  {
    step: '06',
    name: 'Verify',
    badge: 'Health Confirmation',
    summary: 'Confirm service health is restored to 100% SLO',
    description: 'Executes automated end-to-end synthetic verification tests and monitors golden signals for 60 seconds. If health is not restored, the system escalates deterministically.',
    signals: ['Zero 5xx response rate', 'Liveness probe passing', 'Latency within SLO (<50ms)', 'Automatic incident closure']
  }
];

export const RECOVERY_ACTIONS = [
  {
    title: 'Restart / Replace Pod',
    trigger: 'Container OOM, deadlock, or unhandled exit code',
    description: 'Gracefully drains traffic, cordons failing instances, and schedules clean container pods on optimal nodes within 2.5 seconds.',
    commandPreview: 'kubectl replace --force -f pod.yaml'
  },
  {
    title: 'Scale Replicas',
    trigger: 'High CPU/memory load or inbound request queue backup',
    description: 'Calculates the required pod capacity based on incoming traffic vectors and triggers instantaneous horizontal pod autoscaling.',
    commandPreview: 'kubectl scale deployment --replicas=12'
  },
  {
    title: 'Rollback Deployment',
    trigger: 'Canary error rates or 5xx regression post-release',
    description: 'Safely halts in-flight rollouts and reverts replica sets to the prior healthy release snapshot without dropping active connections.',
    commandPreview: 'kubectl rollout undo deployment/api-svc'
  },
  {
    title: 'Reroute Traffic',
    trigger: 'Availability zone degradation or localized packet loss',
    description: 'Adjusts service mesh ingress weights to bypass degraded zones and channel requests to healthy regional endpoints.',
    commandPreview: 'istioctl route update --weight=0:az-b'
  },
  {
    title: 'Alert & Escalate',
    trigger: 'Exceeded retry circuit breakers or unknown fatal panic',
    description: 'Prevents destructive restart loops, preserves forensic stack traces, and pages on-call teams with an enriched root-cause diagnosis.',
    commandPreview: 'notify-admin --severity=P1 --rca-dump'
  }
];
