const TECH = {
  client:       { name: 'Client', label: 'Web / Mobile App', type: 'Edge', role: 'Users watch, upload, search, and comment via browsers and mobile apps.' },
  dns:          { name: 'DNS', label: 'DNS Server', type: 'Infrastructure', role: 'Resolves youtube.com and routes users to the nearest CDN edge or API region.' },
  cdn:          { name: 'CDN', label: 'Content Delivery Network', type: 'Edge', role: 'Caches and serves video segments globally. Handles 90%+ of read traffic at the edge.' },
  loadbalancer: { name: 'Load Balancer', label: 'Load Balancer', type: 'Infrastructure', role: 'Distributes API requests across stateless backend servers.' },
  apigateway:   { name: 'API Gateway', label: 'API Gateway', type: 'Infrastructure', role: 'Single entry point for all API calls — auth, rate limiting, routing to microservices.' },
  service:      { name: 'Microservice', label: 'App Service', type: 'Application', role: 'Stateless service handling a domain: upload, video metadata, search, comments, or recommendations.' },
  transcoder:   { name: 'Transcoder', label: 'Video Transcoder', type: 'Processing', role: 'Converts raw uploads into multiple resolutions (360p–4K) and formats (DASH/HLS).' },
  blobstorage:  { name: 'Blob Storage', label: 'Object Storage (S3/GCS)', type: 'Storage', role: 'Stores raw uploads and encoded video chunks. Cheap, durable, massive scale.' },
  kafka:        { name: 'Kafka', label: 'Apache Kafka', type: 'Messaging', role: 'Event stream for uploads, view counts, analytics, and async pipeline triggers.' },
  redis:        { name: 'Redis', label: 'Redis Cache', type: 'Cache', role: 'Caches hot video metadata, trending lists, sessions, and real-time view counters.' },
  cassandra:    { name: 'Cassandra', label: 'Apache Cassandra', type: 'Database', role: 'Stores video metadata, comments, and subscriptions at massive write scale.' },
  elasticsearch:{ name: 'Elasticsearch', label: 'Elasticsearch', type: 'Search', role: 'Full-text search index for videos, channels, and autocomplete suggestions.' },
};

const USER_SCALES = {
  '10k': {
    label: '10,000 users',
    short: '10K',
    users: 10000,
    readQps: 50,
    writeQps: 5,
    minServices: 1,
    animSpeed: 1.5,
    requiredTech: [
      { tech: 'client', msg: 'Missing Client — users need an entry point' },
      { tech: 'dns', msg: 'Missing DNS — domain must resolve' },
      { tech: 'service', msg: 'Missing Service — need at least one backend' },
      { tech: 'blobstorage', msg: 'Missing Blob Storage — videos must be stored' },
    ],
    requiredPaths: [
      { from: 'client', to: 'dns', msg: 'Client must connect to DNS' },
      { from: 'service', to: 'blobstorage', msg: 'Service must connect to Blob Storage' },
    ],
    hint: 'Startup scale — a simple stack works. CDN and cache recommended.',
  },
  '1m': {
    label: '1,000,000 users',
    short: '1M',
    users: 1000000,
    readQps: 5000,
    writeQps: 500,
    minServices: 2,
    animSpeed: 1.0,
    requiredTech: [
      { tech: 'client', msg: 'Missing Client' },
      { tech: 'dns', msg: 'Missing DNS' },
      { tech: 'cdn', msg: 'Missing CDN — 1M users need edge video delivery' },
      { tech: 'loadbalancer', msg: 'Missing Load Balancer — API traffic too high for one server' },
      { tech: 'apigateway', msg: 'Missing API Gateway' },
      { tech: 'blobstorage', msg: 'Missing Blob Storage' },
      { tech: 'redis', msg: 'Missing Redis — 1M users crush DB without cache' },
      { tech: 'kafka', msg: 'Missing Kafka — upload pipeline needs async processing' },
      { tech: 'transcoder', msg: 'Missing Transcoder' },
    ],
    requiredPaths: [
      { from: 'client', to: 'dns', msg: 'Client must connect to DNS' },
      { from: 'dns', to: 'cdn', msg: 'DNS must route to CDN' },
      { from: 'dns', to: 'loadbalancer', msg: 'DNS must route to Load Balancer' },
      { from: 'loadbalancer', to: 'apigateway', msg: 'Load Balancer must connect to API Gateway' },
      { from: 'apigateway', to: 'service', msg: 'API Gateway must connect to Services' },
      { from: 'service', to: 'blobstorage', msg: 'Upload path must reach Blob Storage' },
      { from: 'blobstorage', to: 'cdn', msg: 'Blob Storage must feed CDN' },
      { from: 'service', to: 'redis', msg: 'Services must use Redis cache' },
      { from: 'kafka', to: 'transcoder', msg: 'Kafka must trigger Transcoder' },
    ],
    hint: 'Growth scale — CDN, caching, and async upload pipeline are mandatory.',
  },
  '10m': {
    label: '10,000,000+ users',
    short: '10M+',
    users: 10000000,
    readQps: 50000,
    writeQps: 5000,
    minServices: 3,
    animSpeed: 0.55,
    requiredTech: [
      { tech: 'client', msg: 'Missing Client' },
      { tech: 'dns', msg: 'Missing DNS' },
      { tech: 'cdn', msg: 'Missing CDN — 10M+ users require global edge delivery' },
      { tech: 'loadbalancer', msg: 'Missing Load Balancer' },
      { tech: 'apigateway', msg: 'Missing API Gateway' },
      { tech: 'blobstorage', msg: 'Missing Blob Storage' },
      { tech: 'kafka', msg: 'Missing Kafka — event streaming at massive scale' },
      { tech: 'transcoder', msg: 'Missing Transcoder' },
      { tech: 'redis', msg: 'Missing Redis' },
      { tech: 'cassandra', msg: 'Missing Cassandra — SQL cannot handle 10M+ write load' },
      { tech: 'elasticsearch', msg: 'Missing Elasticsearch — search at scale' },
    ],
    requiredPaths: [
      { from: 'client', to: 'dns', msg: 'Client must connect to DNS' },
      { from: 'dns', to: 'cdn', msg: 'DNS must route to CDN' },
      { from: 'dns', to: 'loadbalancer', msg: 'DNS must route to Load Balancer' },
      { from: 'loadbalancer', to: 'apigateway', msg: 'Load Balancer must connect to API Gateway' },
      { from: 'apigateway', to: 'service', msg: 'API Gateway must connect to Services' },
      { from: 'service', to: 'blobstorage', msg: 'Upload Service must connect to Blob Storage' },
      { from: 'blobstorage', to: 'kafka', msg: 'Blob Storage must trigger Kafka events' },
      { from: 'kafka', to: 'transcoder', msg: 'Kafka must trigger Transcoder' },
      { from: 'transcoder', to: 'blobstorage', msg: 'Transcoder must write back to storage' },
      { from: 'blobstorage', to: 'cdn', msg: 'Blob Storage must feed CDN' },
      { from: 'service', to: 'redis', msg: 'Video Service must connect to Redis' },
      { from: 'service', to: 'cassandra', msg: 'Service must connect to Cassandra' },
      { from: 'service', to: 'elasticsearch', msg: 'Search Service must connect to Elasticsearch' },
    ],
    hint: 'YouTube scale — full distributed architecture with cache, NoSQL, search, and async pipeline.',
  },
};

const TECH_CAPACITY = {
  client: 5, dns: 10, cdn: 35, loadbalancer: 20, apigateway: 15,
  service: 8, transcoder: 15, blobstorage: 25, kafka: 20,
  redis: 25, cassandra: 30, elasticsearch: 15,
};

const SCENARIOS = {
  search: {
    label: 'Search Video',
    icon: '🔍',
    type: 'read',
    serviceKey: 'search',
    serviceLabel: 'Search Service',
    pathKeys: ['client', 'dns', 'loadbalancer', 'apigateway', 'service:search', 'elasticsearch'],
    description: 'User searches "cat videos" → DNS → LB → Gateway → Search Service → Elasticsearch index',
    requiredTech: [
      { tech: 'client', msg: 'Missing Client' },
      { tech: 'dns', msg: 'Missing DNS' },
      { tech: 'loadbalancer', msg: 'Missing Load Balancer' },
      { tech: 'apigateway', msg: 'Missing API Gateway' },
      { tech: 'elasticsearch', msg: 'Missing Elasticsearch — search needs an index' },
    ],
    requiredPaths: [
      { from: 'client', to: 'dns', msg: 'Client must reach DNS' },
      { from: 'dns', to: 'loadbalancer', msg: 'DNS must route to Load Balancer' },
      { from: 'loadbalancer', to: 'apigateway', msg: 'LB must connect to API Gateway' },
      { from: 'apigateway', to: 'service', serviceKey: 'search', msg: 'Gateway must connect to Search Service' },
      { from: 'service', to: 'elasticsearch', serviceKey: 'search', msg: 'Search Service must query Elasticsearch' },
    ],
    baseLatency: 35,
  },
  comment: {
    label: 'Comment Video',
    icon: '💬',
    type: 'write',
    serviceKey: 'comment',
    serviceLabel: 'Comment Service',
    pathKeys: ['client', 'dns', 'loadbalancer', 'apigateway', 'service:comment', 'cassandra', 'kafka'],
    description: 'User posts comment → Gateway → Comment Service → Cassandra (persist) → Kafka (notify)',
    requiredTech: [
      { tech: 'client', msg: 'Missing Client' },
      { tech: 'dns', msg: 'Missing DNS' },
      { tech: 'loadbalancer', msg: 'Missing Load Balancer' },
      { tech: 'apigateway', msg: 'Missing API Gateway' },
      { tech: 'cassandra', msg: 'Missing Cassandra — comments need write-heavy storage' },
      { tech: 'kafka', msg: 'Missing Kafka — comment events need async fan-out' },
    ],
    requiredPaths: [
      { from: 'client', to: 'dns', msg: 'Client must reach DNS' },
      { from: 'loadbalancer', to: 'apigateway', msg: 'LB must connect to API Gateway' },
      { from: 'apigateway', to: 'service', serviceKey: 'comment', msg: 'Gateway must connect to Comment Service' },
      { from: 'service', to: 'cassandra', serviceKey: 'comment', msg: 'Comment Service must write to Cassandra' },
      { from: 'service', to: 'kafka', serviceKey: 'comment', msg: 'Comment Service must publish to Kafka' },
    ],
    baseLatency: 80,
  },
  recommend: {
    label: 'Recommend Videos',
    icon: '✨',
    type: 'read',
    serviceKey: 'recommendation',
    serviceLabel: 'Recommend Service',
    pathKeys: ['client', 'dns', 'loadbalancer', 'apigateway', 'service:recommendation', 'redis', 'kafka'],
    description: 'User opens homepage → Recommend Service → Redis (cache) + Kafka (user events)',
    requiredTech: [
      { tech: 'client', msg: 'Missing Client' },
      { tech: 'dns', msg: 'Missing DNS' },
      { tech: 'loadbalancer', msg: 'Missing Load Balancer' },
      { tech: 'apigateway', msg: 'Missing API Gateway' },
      { tech: 'redis', msg: 'Missing Redis — recommendations need fast cache' },
      { tech: 'kafka', msg: 'Missing Kafka — user behavior events feed ML pipeline' },
    ],
    requiredPaths: [
      { from: 'client', to: 'dns', msg: 'Client must reach DNS' },
      { from: 'loadbalancer', to: 'apigateway', msg: 'LB must connect to API Gateway' },
      { from: 'apigateway', to: 'service', serviceKey: 'recommendation', msg: 'Gateway must connect to Recommend Service' },
      { from: 'service', to: 'redis', serviceKey: 'recommendation', msg: 'Recommend Service must use Redis cache' },
      { from: 'service', to: 'kafka', serviceKey: 'recommendation', msg: 'Recommend Service must emit Kafka events' },
    ],
    baseLatency: 50,
  },
  upload: {
    label: 'Upload Video',
    icon: '📤',
    type: 'write',
    serviceKey: 'upload',
    serviceLabel: 'Upload Service',
    pathKeys: ['client', 'dns', 'loadbalancer', 'apigateway', 'service:upload', 'blobstorage', 'kafka', 'transcoder', 'blobstorage', 'cdn'],
    description: 'User uploads video → Upload Service → Blob Storage → Kafka → Transcoder → CDN',
    requiredTech: [
      { tech: 'client', msg: 'Missing Client' },
      { tech: 'dns', msg: 'Missing DNS' },
      { tech: 'loadbalancer', msg: 'Missing Load Balancer' },
      { tech: 'apigateway', msg: 'Missing API Gateway' },
      { tech: 'blobstorage', msg: 'Missing Blob Storage' },
      { tech: 'kafka', msg: 'Missing Kafka — async upload pipeline' },
      { tech: 'transcoder', msg: 'Missing Transcoder' },
      { tech: 'cdn', msg: 'Missing CDN — encoded video served from edge' },
    ],
    requiredPaths: [
      { from: 'client', to: 'dns', msg: 'Client must reach DNS' },
      { from: 'loadbalancer', to: 'apigateway', msg: 'LB must connect to API Gateway' },
      { from: 'apigateway', to: 'service', serviceKey: 'upload', msg: 'Gateway must connect to Upload Service' },
      { from: 'service', to: 'blobstorage', serviceKey: 'upload', msg: 'Upload Service must write to Blob Storage' },
      { from: 'blobstorage', to: 'kafka', msg: 'Storage must trigger Kafka' },
      { from: 'kafka', to: 'transcoder', msg: 'Kafka must trigger Transcoder' },
      { from: 'blobstorage', to: 'cdn', msg: 'Encoded video must reach CDN' },
    ],
    baseLatency: 120,
  },
};

const REQUIRED_TECH = USER_SCALES['10m'].requiredTech;
const REQUIRED_PATHS = USER_SCALES['10m'].requiredPaths;

const YOUTUBE_DESIGN = {
  nodes: [
    { tech: 'client', x: 50, y: 4, label: 'Client', key: 'client' },
    { tech: 'dns', x: 50, y: 14, label: 'DNS', key: 'dns' },
    { tech: 'cdn', x: 22, y: 28, label: 'CDN', key: 'cdn' },
    { tech: 'loadbalancer', x: 50, y: 28, label: 'Load Balancer', key: 'loadbalancer' },
    { tech: 'apigateway', x: 50, y: 40, label: 'API Gateway', key: 'apigateway' },
    { tech: 'service', x: 12, y: 54, label: 'Upload Service', key: 'upload' },
    { tech: 'service', x: 30, y: 54, label: 'Video Service', key: 'video' },
    { tech: 'service', x: 50, y: 54, label: 'Search Service', key: 'search' },
    { tech: 'service', x: 70, y: 54, label: 'Recommend Service', key: 'recommendation' },
    { tech: 'service', x: 88, y: 54, label: 'Comment Service', key: 'comment' },
    { tech: 'kafka', x: 12, y: 72, label: 'Kafka', key: 'kafka' },
    { tech: 'transcoder', x: 30, y: 72, label: 'Transcoder', key: 'transcoder' },
    { tech: 'blobstorage', x: 22, y: 88, label: 'Blob Storage', key: 'blobstorage' },
    { tech: 'redis', x: 50, y: 72, label: 'Redis', key: 'redis' },
    { tech: 'cassandra', x: 70, y: 72, label: 'Cassandra', key: 'cassandra' },
    { tech: 'elasticsearch', x: 50, y: 88, label: 'Elasticsearch', key: 'elasticsearch' },
  ],
  connections: [
    ['client', 'dns'],
    ['dns', 'cdn'],
    ['dns', 'loadbalancer'],
    ['loadbalancer', 'apigateway'],
    ['upload', 'kafka'],
    ['kafka', 'transcoder'],
    ['transcoder', 'blobstorage'],
    ['blobstorage', 'cdn'],
    ['video', 'redis'],
    ['video', 'cassandra'],
    ['search', 'elasticsearch'],
    ['upload', 'blobstorage'],
  ],
  gatewayServices: ['upload', 'video', 'search', 'recommendation', 'comment'],
};

let nodes = [];
let connections = [];
let nodeIdCounter = 0;
let dragNode = null;
let dragOffset = { x: 0, y: 0 };
let requestWaveTimer = null;
let connectMode = false;
let connectSourceId = null;
let validationFailed = false;
let currentScale = '10k';
let currentScenario = 'search';
let simRunning = false;
let simTimer = null;
let simSpawnTimer = null;
let simStats = { total: 0, rps: 0, active: 0, success: 0, failed: 0, latencySum: 0, latencyCount: 0 };
let rpsTimestamps = [];
let scenarioPathIds = [];
let overloadedNodeId = null;
let overloadedNodeUtil = 0;

const TECH_LOAD_FACTOR = {
  elasticsearch: 2.2, cassandra: 2.0, transcoder: 2.0, blobstorage: 1.8,
  kafka: 1.7, redis: 1.5, apigateway: 1.4, loadbalancer: 1.3,
  service: 1.2, dns: 1.0, cdn: 0.9, client: 0.5,
};

const canvas = document.getElementById('canvas');
const canvasNodes = document.getElementById('canvas-nodes');
const connectionsSvg = document.getElementById('connections');
const dropHint = document.getElementById('drop-hint');
const infoPanel = document.getElementById('info-panel');
const toolbarHint = document.getElementById('toolbar-hint');
const resultOverlay = document.getElementById('result-overlay');
const loadFill = document.getElementById('load-fill');
const loadValue = document.getElementById('load-value');
const loadMetrics = document.getElementById('load-metrics');
const simLog = document.getElementById('sim-log');
const simStatus = document.getElementById('sim-status');

function getScale() {
  return USER_SCALES[currentScale];
}

function getScenario() {
  return SCENARIOS[currentScenario];
}

function findNodeForPathKey(step) {
  if (step.startsWith('service:')) {
    const key = step.split(':')[1];
    return nodes.find((n) => n.key === key);
  }
  return nodes.find((n) => n.key === step) || nodes.find((n) => n.tech === step);
}

function getScenarioPathIds() {
  const scenario = getScenario();
  const ids = [];
  for (const step of scenario.pathKeys) {
    const node = findNodeForPathKey(step);
    if (!node) return [];
    ids.push(node.id);
  }
  return ids;
}

function hasServicePath(fromTech, toTech, serviceKey) {
  if (!hasTechPath(fromTech, toTech)) return false;
  if (!serviceKey) return true;
  return nodes.some((n) => n.key === serviceKey && connections.some(([a, b]) => {
    const na = findNode(a);
    const nb = findNode(b);
    return na && nb && (na.id === n.id || nb.id === n.id);
  }));
}

function hasScenarioServiceConnected(serviceKey) {
  const svc = nodes.find((n) => n.key === serviceKey);
  if (!svc) return false;
  const gw = nodes.find((n) => n.tech === 'apigateway');
  if (!gw) return false;
  return hasConnection(gw.id, svc.id) || hasTechPath('apigateway', 'service');
}

function validateScenario() {
  const scenario = getScenario();
  const scale = getScale();
  const issues = [];

  scenario.requiredTech.forEach(({ tech, msg }) => {
    if (!hasTech(tech)) issues.push(msg);
  });

  const svc = nodes.find((n) => n.key === scenario.serviceKey);
  if (!svc) issues.push(`Missing ${scenario.serviceLabel}`);

  scenario.requiredPaths.forEach((rule) => {
    if (rule.serviceKey) {
      if (!hasScenarioServiceConnected(rule.serviceKey) && rule.from === 'apigateway') {
        issues.push(rule.msg);
        return;
      }
      const svcNode = nodes.find((n) => n.key === rule.serviceKey);
      const targetTech = rule.to === 'service' ? null : rule.to;
      if (svcNode && targetTech) {
        const target = nodes.find((n) => n.tech === targetTech);
        if (!target || !hasConnection(svcNode.id, target.id)) {
          const connected = connections.some(([a, b]) => {
            const na = findNode(a);
            const nb = findNode(b);
            return na && nb && ((na.id === svcNode.id && nb.tech === targetTech) || (nb.id === svcNode.id && na.tech === targetTech));
          });
          if (!connected && !hasTechPath('service', targetTech)) issues.push(rule.msg);
        }
      }
    } else if (!hasTechPath(rule.from, rule.to)) {
      issues.push(rule.msg);
    }
  });

  const pathIds = getScenarioPathIds();
  if (pathIds.length < scenario.pathKeys.length) {
    issues.push(`Incomplete ${scenario.label} path — connect all components in the flow`);
  }

  const { loadPct } = calcSystemLoad(simStats.rps || 0);
  if (loadPct >= 100) {
    const pathIds = getScenarioPathIds();
    const bn = findBottleneckNode(pathIds);
    if (bn.node) {
      issues.push(`System overloaded at ${bn.node.label} (${bn.util}% capacity) — scale up or add cache`);
    } else {
      issues.push(`System overloaded at ${scale.label} for ${scenario.label} (${loadPct}% capacity)`);
    }
  }

  return { passed: issues.length === 0, issues, loadPct };
}

function calcSystemLoad(extraRps = 0) {
  const scale = getScale();
  const scenario = getScenario();
  const demand = Math.log10(scale.users) * 18 + (extraRps / 50);
  let capacity = 10;
  nodes.forEach((n) => { capacity += TECH_CAPACITY[n.tech] || 5; });
  if (scenario.type === 'write') capacity *= 0.85;
  const loadPct = Math.min(150, Math.round((demand / capacity) * 100));
  const latency = loadPct < 50 ? '< 50ms' : loadPct < 80 ? '~200ms' : loadPct < 100 ? '~800ms' : 'TIMEOUT';
  return { loadPct, capacity: Math.round(capacity), demand: Math.round(demand), latency, readQps: scale.readQps, writeQps: scale.writeQps };
}

function updateLoadBar() {
  const scale = getScale();
  const { loadPct, latency, readQps, writeQps } = calcSystemLoad(simStats.rps);
  loadFill.style.width = `${Math.min(100, loadPct)}%`;
  loadFill.className = 'load-bar-fill' + (loadPct >= 100 ? ' overload' : loadPct >= 75 ? ' warn' : '');
  loadValue.textContent = `${loadPct}%`;
  loadValue.className = 'load-bar-value' + (loadPct >= 100 ? ' overload' : loadPct >= 75 ? ' warn' : '');
  const scenario = getScenario();
  loadMetrics.innerHTML = `
    <span>${scale.label} · ${scenario.label}</span>
    <span>${scenario.type === 'read' ? 'Read' : 'Write'} ~${(scenario.type === 'read' ? readQps : writeQps).toLocaleString()} QPS</span>
    <span>Live RPS: ${simStats.rps}</span>
    <span>Latency ${simRunning ? (simStats.latencyCount ? `${Math.round(simStats.latencySum / simStats.latencyCount)}ms` : latency) : latency}</span>
  `;
}

function updateSimUI() {
  document.getElementById('stat-total').textContent = simStats.total.toLocaleString();
  document.getElementById('stat-rps').textContent = simStats.rps;
  document.getElementById('stat-active').textContent = simStats.active;
  document.getElementById('stat-success').textContent = simStats.success.toLocaleString();
  document.getElementById('stat-failed').textContent = simStats.failed.toLocaleString();
  const avgLat = simStats.latencyCount ? `${Math.round(simStats.latencySum / simStats.latencyCount)}ms` : '—';
  document.getElementById('stat-latency').textContent = avgLat;
  document.getElementById('sim-scenario-name').textContent = getScenario().label;
  simStatus.textContent = simRunning ? 'LIVE' : 'Idle';
  simStatus.className = 'sim-status' + (simRunning ? ' live' : '');
}

function addSimLog(msg, type = '') {
  if (!simLog) return;
  const line = document.createElement('div');
  line.className = `sim-log-line ${type}`;
  line.textContent = msg;
  simLog.prepend(line);
  while (simLog.children.length > 12) simLog.lastChild.remove();
}

function getNodeUtilization(nodeId, demand) {
  const node = findNode(nodeId);
  if (!node) return 0;
  const cap = TECH_CAPACITY[node.tech] || 5;
  const factor = TECH_LOAD_FACTOR[node.tech] || 1;
  return Math.round(((demand * factor) / cap) * 100);
}

function findBottleneckNode(pathIds) {
  const demand = Math.max(simStats.rps, 1);
  let worstId = null;
  let worstUtil = 0;

  pathIds.forEach((id) => {
    const util = getNodeUtilization(id, demand);
    if (util > worstUtil) {
      worstUtil = util;
      worstId = id;
    }
  });

  return { id: worstId, util: worstUtil, node: worstId ? findNode(worstId) : null };
}

function findMissingPathStep() {
  const scenario = getScenario();
  for (const step of scenario.pathKeys) {
    if (!findNodeForPathKey(step)) {
      const label = step.startsWith('service:')
        ? scenario.pathKeys.includes(step) && SCENARIOS[currentScenario]?.serviceLabel
        : TECH[step]?.label || step;
      return step.startsWith('service:') ? getScenario().serviceLabel : (TECH[step]?.label || step);
    }
  }
  return null;
}

function setOverloadedNode(nodeId, util, silent = false) {
  const node = findNode(nodeId);
  if (!node) return;
  const changed = overloadedNodeId !== nodeId;
  overloadedNodeId = nodeId;
  overloadedNodeUtil = util;
  updateOverloadAlert(node.label, util);
  if (!silent && changed) addSimLog(`🔥 OVERLOAD at ${node.label} (${util}% capacity)`, 'fail');
}

function clearOverloadedNode() {
  overloadedNodeId = null;
  overloadedNodeUtil = 0;
  document.querySelectorAll('.canvas-node').forEach((el) => el.classList.remove('node-overloaded'));
  const alert = document.getElementById('overload-alert');
  if (alert) alert.hidden = true;
}

function updateOverloadAlert(nodeLabel, util) {
  const alert = document.getElementById('overload-alert');
  if (!alert) return;
  alert.hidden = false;
  alert.innerHTML = `<span class="overload-alert-icon">🔥</span> Bottleneck: <strong>${nodeLabel}</strong> at ${util}% capacity`;
}

function updateRps() {
  const now = Date.now();
  rpsTimestamps = rpsTimestamps.filter((t) => now - t < 1000);
  simStats.rps = rpsTimestamps.length;
}

function animateRequestOnPath(pathIds, onDone) {
  const scenario = getScenario();
  const demand = simStats.rps + 1;
  const { loadPct } = calcSystemLoad(demand);
  const pathBroken = pathIds.length < scenario.pathKeys.length;
  const bottleneck = findBottleneckNode(pathIds);
  const overloaded = loadPct >= 100 || pathBroken || bottleneck.util >= 100;
  const failAtId = pathBroken ? null : (overloaded ? bottleneck.id : null);
  const baseLat = scenario.baseLatency;
  const latency = overloaded ? baseLat * 8 : baseLat + Math.random() * 30 + loadPct * 2;

  if (overloaded && failAtId) setOverloadedNode(failAtId, bottleneck.util);

  let step = 0;
  const stepMs = Math.max(80, 200 / getScale().animSpeed);

  function nextStep() {
    if (step >= pathIds.length) {
      onDone(!overloaded, latency);
      return;
    }
    const id = pathIds[step];
    const el = document.querySelector(`.canvas-node[data-id="${id}"]`);
    pulseNode(id);
    el?.classList.add('request-active');

    if (overloaded && id === failAtId) {
      el?.classList.remove('request-active');
      el?.classList.add('node-overloaded');
      onDone(false, latency);
      return;
    }

    setTimeout(() => {
      el?.classList.remove('request-active');
      step++;
      nextStep();
    }, stepMs);
  }
  nextStep();
}

function spawnRequest() {
  const pathIds = getScenarioPathIds();
  simStats.total++;
  simStats.active++;
  rpsTimestamps.push(Date.now());
  updateRps();

  if (!pathIds.length) {
    simStats.active--;
    simStats.failed++;
    const missing = findMissingPathStep();
    addSimLog(`✗ ${getScenario().label} — path broken${missing ? ` (missing ${missing})` : ''}`, 'fail');
    updateSimUI();
    updateLoadBar();
    return;
  }

  animateRequestOnPath(pathIds, (success, latency) => {
    simStats.active--;
    if (success) {
      simStats.success++;
      simStats.latencySum += latency;
      simStats.latencyCount++;
      if (simStats.total % 10 === 0) addSimLog(`✓ req #${simStats.total} handled in ${Math.round(latency)}ms`, 'ok');
    } else {
      simStats.failed++;
      const bn = findNode(overloadedNodeId);
      addSimLog(`✗ req #${simStats.total} TIMEOUT${bn ? ` — stuck at ${bn.label}` : ' — system overloaded'}`, 'fail');
    }
    updateSimUI();
    updateLoadBar();
  });
  updateSimUI();
  updateLoadBar();
}

function startSimulation() {
  if (simRunning) return;
  if (!nodes.length) {
    addSimLog('Add components to the canvas first', 'fail');
    return;
  }
  simRunning = true;
  document.getElementById('btn-simulate').textContent = '⏹ Stop Traffic';
  document.getElementById('btn-simulate').classList.add('active');
  stopRequestAnimation();
  addSimLog(`▶ Simulating ${getScenario().label} at ${getScale().label}`, 'ok');

  const scale = getScale();
  const baseInterval = getScenario().type === 'write' ? 600 : 350;
  const interval = baseInterval / getScale().animSpeed;

  simSpawnTimer = setInterval(spawnRequest, interval);
  simTimer = setInterval(() => {
    updateRps();
    updateSimUI();
    updateLoadBar();
    const growth = 1 + Math.floor(simStats.total / 200);
    if (growth > 1 && Math.random() < 0.3) {
      addSimLog(`📈 Traffic spike — ${simStats.rps} req/s`, 'warn');
    }
  }, 500);
  spawnRequest();
}

function stopSimulation() {
  simRunning = false;
  if (simSpawnTimer) { clearInterval(simSpawnTimer); simSpawnTimer = null; }
  if (simTimer) { clearInterval(simTimer); simTimer = null; }
  document.getElementById('btn-simulate').textContent = '▶ Simulate Traffic';
  document.getElementById('btn-simulate').classList.remove('active');
  simStatus.textContent = 'Idle';
  simStatus.className = 'sim-status';
  if (nodes.length && !validationFailed) startRequestAnimation();
}

function resetSimStats() {
  simStats = { total: 0, rps: 0, active: 0, success: 0, failed: 0, latencySum: 0, latencyCount: 0 };
  rpsTimestamps = [];
  clearOverloadedNode();
  if (simLog) simLog.innerHTML = '';
  updateSimUI();
}

function setScenario(scenarioKey) {
  stopSimulation();
  resetSimStats();
  currentScenario = scenarioKey;
  validationFailed = false;
  document.querySelectorAll('.scenario-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.scenario === scenarioKey);
  });
  scenarioPathIds = getScenarioPathIds();
  updateInfoPanelDefault();
  render();
}

function updateInfoPanelDefault() {
  const scale = getScale();
  const scenario = getScenario();
  scenarioPathIds = getScenarioPathIds();
  const pathOk = scenarioPathIds.length === scenario.pathKeys.length;
  infoPanel.innerHTML = `
    <div class="scale-info">
      <div class="info-name">${scenario.icon} ${scenario.label}</div>
      <div class="info-type">${scale.label} · ${scenario.type === 'read' ? 'Read' : 'Write'} path</div>
    </div>
    <p class="info-role">${scenario.description}</p>
    <div class="path-status ${pathOk ? 'ok' : 'broken'}">
      ${pathOk ? '✓ Path complete — ready to simulate' : '⚠ Path incomplete — connect missing components'}
    </div>
    <p class="info-links dim">Hit <strong>Simulate Traffic</strong> to watch requests flow in real time.</p>
  `;
}

function nodeKey(n) {
  return n.key || `node-${n.id}`;
}

function findNode(id) {
  return nodes.find((n) => n.id === id);
}

function findNodeByKey(key) {
  return nodes.find((n) => nodeKey(n) === key);
}

function hasTech(tech) {
  return nodes.some((n) => n.tech === tech);
}

function createNode(tech, xPct, yPct, label, key) {
  const info = TECH[tech];
  const id = ++nodeIdCounter;
  return {
    id,
    tech,
    x: xPct,
    y: yPct,
    label: label || info.label,
    key: key || `node-${id}`,
  };
}

function connKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function hasConnection(idA, idB) {
  return connections.some(([a, b]) => connKey(a, b) === connKey(idA, idB));
}

function addConnection(idA, idB) {
  if (idA === idB || hasConnection(idA, idB)) return false;
  connections.push([idA, idB]);
  return true;
}

function removeConnection(idA, idB) {
  connections = connections.filter(([a, b]) => connKey(a, b) !== connKey(idA, idB));
}

function buildTechGraph() {
  const graph = {};
  const addEdge = (t1, t2) => {
    if (!graph[t1]) graph[t1] = new Set();
    if (!graph[t2]) graph[t2] = new Set();
    graph[t1].add(t2);
    graph[t2].add(t1);
  };
  connections.forEach(([fromId, toId]) => {
    const a = findNode(fromId);
    const b = findNode(toId);
    if (a && b) addEdge(a.tech, b.tech);
  });
  return graph;
}

function hasTechPath(fromTech, toTech) {
  if (fromTech === toTech) return hasTech(fromTech);
  const graph = buildTechGraph();
  if (!graph[fromTech]) return false;
  const visited = new Set([fromTech]);
  const queue = [fromTech];
  while (queue.length) {
    const cur = queue.shift();
    for (const next of graph[cur] || []) {
      if (next === toTech) return true;
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}

function validateDesign() {
  return validateScenario();
}

function showResult(passed, issues) {
  validationFailed = !passed;
  const scale = getScale();
  const card = document.getElementById('result-card');
  document.getElementById('result-icon').textContent = passed ? '🏆' : '💥';
  document.getElementById('result-title').textContent = passed ? 'Design Passed!' : 'Design Failed!';
  document.getElementById('result-message').textContent = passed
    ? `Your ${getScenario().label} architecture handles ${scale.label}.`
    : `Your ${getScenario().label} design fails at ${scale.label}. Fix the issues below.`;
  const list = document.getElementById('result-issues');
  list.innerHTML = issues.map((i) => `<li>${i}</li>`).join('');
  list.style.display = issues.length ? 'block' : 'none';
  card.className = `result-card ${passed ? 'success' : 'fail'}`;
  resultOverlay.hidden = false;
  render();
}

function render() {
  dropHint.style.display = nodes.length ? 'none' : 'block';
  canvas.classList.toggle('validation-fail', validationFailed);
  scenarioPathIds = getScenarioPathIds();
  const pathSet = new Set(scenarioPathIds);
  const { loadPct } = calcSystemLoad(simStats.rps);
  canvas.classList.toggle('system-overload', loadPct >= 100 && nodes.length > 0);
  document.getElementById('load-bar-wrap')?.classList.toggle('overload', loadPct >= 100);

  if (loadPct >= 100 && scenarioPathIds.length) {
    const bn = findBottleneckNode(scenarioPathIds);
    if (bn.id) setOverloadedNode(bn.id, bn.util, true);
  } else if (overloadedNodeId && loadPct < 90) {
    clearOverloadedNode();
  }

  canvasNodes.innerHTML = nodes.map((n) => {
    const isSource = connectSourceId === n.id;
    const isError = validationFailed && isNodeProblematic(n);
    const onPath = pathSet.has(n.id);
    const isOverloaded = overloadedNodeId === n.id;
    return `
      <div class="canvas-node${isSource ? ' connect-source' : ''}${isError ? ' node-error' : ''}${onPath ? ' on-path' : ''}${isOverloaded ? ' node-overloaded' : ''}"
           data-id="${n.id}" style="left:${n.x}%;top:${n.y}%;transform:translate(-50%,-50%)">
        ${isOverloaded ? `<span class="overload-badge">OVERLOAD ${overloadedNodeUtil}%</span>` : ''}
        <div class="canvas-node-frame">
          <img src="icons/${n.tech}.svg" alt="${n.label}">
        </div>
        <span class="canvas-node-label">${n.label}</span>
      </div>
    `;
  }).join('');

  canvasNodes.querySelectorAll('.canvas-node').forEach((el) => {
    const id = parseInt(el.dataset.id, 10);
    el.addEventListener('mousedown', (e) => {
      if (connectMode) return;
      startNodeDrag(e, id);
    });
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (connectMode) handleConnectClick(id);
      else selectNode(id);
    });
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      if (!connectMode) removeNode(id);
    });
  });

  drawConnections();
  updateLoadBar();
  updateSimUI();
  if (!validationFailed && !simRunning) startRequestAnimation();
}

function isNodeProblematic(n) {
  const result = validateScenario();
  if (result.passed) return false;
  const scenario = getScenario();
  const missingTech = scenario.requiredTech.filter(({ tech }) => !hasTech(tech)).map(({ tech }) => tech);
  if (missingTech.includes(n.tech)) return true;
  if (n.key === scenario.serviceKey && !hasScenarioServiceConnected(scenario.serviceKey)) return true;
  return false;
}

function handleConnectClick(id) {
  if (!connectSourceId) {
    connectSourceId = id;
    render();
    toolbarHint.textContent = 'Click a second component to connect · Click same to cancel';
    return;
  }
  if (connectSourceId === id) {
    connectSourceId = null;
    render();
    toolbarHint.textContent = 'Connect mode: click two components to draw a line';
    return;
  }
  addConnection(connectSourceId, id);
  connectSourceId = null;
  validationFailed = false;
  render();
  toolbarHint.textContent = 'Connect mode: click two components to draw a line';
}

function setConnectMode(on) {
  connectMode = on;
  connectSourceId = null;
  const btn = document.getElementById('btn-connect');
  btn.classList.toggle('active', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  toolbarHint.textContent = on
    ? 'Connect mode: click two components to draw a line'
    : 'Drop icons · Drag to move · Double-click to remove · Connect mode to draw lines';
  render();
}

function connectionPathD(a, b, w, h) {
  const p1 = { x: (a.x / 100) * w, y: (a.y / 100) * h };
  const p2 = { x: (b.x / 100) * w, y: (b.y / 100) * h };
  const midY = (p1.y + p2.y) / 2;
  return `M${p1.x},${p1.y} C${p1.x},${midY} ${p2.x},${midY} ${p2.x},${p2.y}`;
}

function getNodeVisitOrder() {
  if (!nodes.length) return [];
  const start = nodes.find((n) => n.tech === 'client') || nodes[0];
  const adj = new Map();
  nodes.forEach((n) => adj.set(n.id, []));
  connections.forEach(([fromId, toId]) => {
    adj.get(fromId)?.push(toId);
    adj.get(toId)?.push(fromId);
  });
  const visited = new Set();
  const order = [];
  const queue = [start.id];
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    order.push(id);
    (adj.get(id) || []).forEach((next) => {
      if (!visited.has(next)) queue.push(next);
    });
  }
  nodes.forEach((n) => {
    if (!order.includes(n.id)) order.push(n.id);
  });
  return order;
}

function stopRequestAnimation() {
  if (requestWaveTimer) {
    clearTimeout(requestWaveTimer);
    requestWaveTimer = null;
  }
  document.querySelectorAll('.canvas-node').forEach((el) => {
    el.classList.remove('request-hit', 'request-active');
  });
}

function pulseNode(id) {
  const el = document.querySelector(`.canvas-node[data-id="${id}"]`);
  if (!el) return;
  el.classList.remove('request-hit');
  void el.offsetWidth;
  el.classList.add('request-hit');
}

function startRequestAnimation() {
  stopRequestAnimation();
  if (!nodes.length || validationFailed) return;
  const order = getNodeVisitOrder();
  if (!order.length) return;

  function runWave() {
    document.querySelectorAll('.canvas-node').forEach((el) => el.classList.remove('request-active'));
    order.forEach((id, i) => {
      setTimeout(() => {
        pulseNode(id);
        document.querySelector(`.canvas-node[data-id="${id}"]`)?.classList.add('request-active');
      }, (i * 320) / getScale().animSpeed);
    });
    requestWaveTimer = setTimeout(runWave, (order.length * 320 + 900) / getScale().animSpeed);
  }
  runWave();
}

function drawConnections() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  connectionsSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  if (!connections.length) {
    connectionsSvg.innerHTML = '';
    return;
  }

  const lineClass = validationFailed ? 'conn-line conn-line-error' : 'conn-line';
  const pathConnSet = new Set();
  for (let i = 0; i < scenarioPathIds.length - 1; i++) {
    pathConnSet.add(connKey(scenarioPathIds[i], scenarioPathIds[i + 1]));
  }

  const paths = connections.map(([fromId, toId], i) => {
    const a = findNode(fromId);
    const b = findNode(toId);
    if (!a || !b) return null;
    const d = connectionPathD(a, b, w, h);
    const onPath = pathConnSet.has(connKey(fromId, toId));
    const cls = validationFailed ? lineClass : (onPath ? 'conn-line conn-line-path' : lineClass);
    const dur = (1.6 + (i % 4) * 0.35) / getScale().animSpeed;
    const particles = (validationFailed || simRunning) ? '' : [0, dur * 0.45, dur * 0.78].map((begin) => `
      <circle r="4.5" class="request-dot" fill="#ffd54f">
        <animateMotion dur="${dur}s" repeatCount="indefinite" begin="${begin}s" path="${d}" calcMode="linear"/>
      </circle>
      <circle r="8" class="request-dot-trail" fill="#5b8cff" opacity="0.35">
        <animateMotion dur="${dur}s" repeatCount="indefinite" begin="${begin}s" path="${d}" calcMode="linear"/>
      </circle>
    `).join('');
    return `
      <path class="${cls}" d="${d}"/>
      <g class="request-particles">${particles}</g>
    `;
  }).filter(Boolean);

  connectionsSvg.innerHTML = `
    <defs>
      <filter id="request-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${paths.join('')}
  `;
  if (!validationFailed) {
    connectionsSvg.querySelectorAll('.request-dot').forEach((dot) => {
      dot.setAttribute('filter', 'url(#request-glow)');
    });
  }
}

function selectNode(id) {
  const n = findNode(id);
  if (!n) return;
  const info = TECH[n.tech];
  const linked = connections.filter(([a, b]) => a === id || b === id);
  document.querySelectorAll('.canvas-node').forEach((el) => el.classList.remove('selected'));
  document.querySelector(`.canvas-node[data-id="${id}"]`)?.classList.add('selected');
  infoPanel.innerHTML = `
    <div class="info-header">
      <img src="icons/${n.tech}.svg" alt="">
      <div>
        <div class="info-name">${n.label}</div>
        <div class="info-type">${info.type}</div>
      </div>
    </div>
    <p class="info-role">${info.role}</p>
    ${linked.length ? `<p class="info-links">${linked.length} connection${linked.length > 1 ? 's' : ''}</p>` : '<p class="info-links dim">No connections — use Connect Mode</p>'}
  `;
}

function removeNode(id) {
  nodes = nodes.filter((n) => n.id !== id);
  connections = connections.filter(([a, b]) => a !== id && b !== id);
  validationFailed = false;
  render();
  updateInfoPanelDefault();
}

function addNodeAt(tech, xPct, yPct, label, key) {
  nodes.push(createNode(tech, xPct, yPct, label, key));
  validationFailed = false;
  render();
  selectNode(nodeIdCounter);
}

function loadYouTubeDesign() {
  stopRequestAnimation();
  nodes = [];
  connections = [];
  nodeIdCounter = 0;
  validationFailed = false;

  const keyToId = {};
  YOUTUBE_DESIGN.nodes.forEach((n) => {
    const node = createNode(n.tech, n.x, n.y, n.label, n.key);
    nodes.push(node);
    keyToId[n.key] = node.id;
  });

  YOUTUBE_DESIGN.connections.forEach(([from, to]) => {
    addConnection(keyToId[from], keyToId[to]);
  });

  const gwId = keyToId.apigateway;
  YOUTUBE_DESIGN.gatewayServices.forEach((key) => {
    if (keyToId[key] && gwId) addConnection(gwId, keyToId[key]);
  });

  render();
  infoPanel.innerHTML = `
    <div class="info-header"><div>
      <div class="info-name">Reference Design</div>
      <div class="info-type">Answer loaded</div>
    </div></div>
    <p class="info-role">Study this layout, then clear and try building it yourself!</p>
  `;
}

function clearCanvas() {
  stopSimulation();
  stopRequestAnimation();
  resetSimStats();
  clearOverloadedNode();
  nodes = [];
  connections = [];
  connectSourceId = null;
  validationFailed = false;
  render();
  updateInfoPanelDefault();
}

function getCanvasPct(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100)),
    y: Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100)),
  };
}

function startNodeDrag(e, id) {
  if (e.button !== 0) return;
  e.preventDefault();
  stopRequestAnimation();
  dragNode = findNode(id);
  const rect = canvas.getBoundingClientRect();
  dragOffset = {
    x: e.clientX - (dragNode.x / 100) * rect.width,
    y: e.clientY - (dragNode.y / 100) * rect.height,
  };
  document.addEventListener('mousemove', onNodeDrag);
  document.addEventListener('mouseup', stopNodeDrag);
}

function onNodeDrag(e) {
  if (!dragNode) return;
  const rect = canvas.getBoundingClientRect();
  dragNode.x = Math.max(4, Math.min(96, ((e.clientX - dragOffset.x) / rect.width) * 100));
  dragNode.y = Math.max(4, Math.min(96, ((e.clientY - dragOffset.y) / rect.height) * 100));
  const el = document.querySelector(`.canvas-node[data-id="${dragNode.id}"]`);
  if (el) {
    el.style.left = `${dragNode.x}%`;
    el.style.top = `${dragNode.y}%`;
  }
  drawConnections();
}

function stopNodeDrag() {
  dragNode = null;
  document.removeEventListener('mousemove', onNodeDrag);
  document.removeEventListener('mouseup', stopNodeDrag);
  startRequestAnimation();
}

document.querySelectorAll('.palette-icon').forEach((btn) => {
  btn.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      tech: btn.dataset.tech,
      label: btn.dataset.label || null,
      key: btn.dataset.key || null,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  });
});

canvas.addEventListener('dragover', (e) => { e.preventDefault(); canvas.classList.add('drag-over'); });
canvas.addEventListener('dragleave', () => canvas.classList.remove('drag-over'));
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  canvas.classList.remove('drag-over');
  try {
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    if (!TECH[data.tech]) return;
    const { x, y } = getCanvasPct(e);
    addNodeAt(data.tech, x, y, data.label || TECH[data.tech].label, data.key);
  } catch {
    const tech = e.dataTransfer.getData('text/plain');
    if (TECH[tech]) {
      const { x, y } = getCanvasPct(e);
      addNodeAt(tech, x, y);
    }
  }
});

function setUserScale(scaleKey) {
  currentScale = scaleKey;
  validationFailed = false;
  resetSimStats();
  document.querySelectorAll('.scale-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.scale === scaleKey);
  });
  updateInfoPanelDefault();
  render();
}

document.querySelectorAll('.scale-btn').forEach((btn) => {
  btn.addEventListener('click', () => setUserScale(btn.dataset.scale));
});

document.querySelectorAll('.scenario-btn').forEach((btn) => {
  btn.addEventListener('click', () => setScenario(btn.dataset.scenario));
});

document.getElementById('btn-connect').addEventListener('click', () => setConnectMode(!connectMode));
document.getElementById('btn-simulate').addEventListener('click', () => {
  if (simRunning) stopSimulation();
  else startSimulation();
});
document.getElementById('btn-validate').addEventListener('click', () => {
  const result = validateDesign();
  showResult(result.passed, result.issues);
});
document.getElementById('btn-load-youtube').addEventListener('click', loadYouTubeDesign);
document.getElementById('btn-clear').addEventListener('click', clearCanvas);
document.getElementById('btn-close-result').addEventListener('click', () => {
  resultOverlay.hidden = true;
});
resultOverlay.addEventListener('click', (e) => {
  if (e.target === resultOverlay) resultOverlay.hidden = true;
});

window.addEventListener('resize', () => {
  drawConnections();
  updateLoadBar();
});

updateInfoPanelDefault();
updateSimUI();
render();
