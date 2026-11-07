/**
 * ============================================================================
 * ILLUSTRATIVE FIXTURE DATA - NOT CLIENT DATA.
 * ============================================================================
 *
 * Every hostname, IP, hash, account, alert, certificate and metric in this file
 * is INVENTED. Nothing here is derived from, exported from, or representative
 * of any real Envenox engagement, any real client estate, or any real incident.
 * No client telemetry is used to produce marketing material, ever.
 *
 * The CVE identifiers are CVE-*shaped* but fictional. The MITRE ATT&CK technique
 * IDs ARE real and correctly titled, because a wrong technique ID is a tell that
 * the people who built the page have never read a detection rule.
 *
 * WHY THIS FILE EXISTS
 * The product-UI components under `components/product/` stand in for screenshots
 * of third-party security platforms Envenox operates but does not own (managed
 * SIEM, EDR, hosted WAF). Screenshotting a vendor console and presenting it as
 * our own is a trademark, licence and credibility problem. These are drawn in
 * HTML/CSS/SVG instead, which also means they are sharp at any zoom, correct in
 * all three palettes, and animatable.
 *
 * THE ESTATE
 * One fictional tenant - Northwind Logistics Group (`TEN-4471`, estate
 * `nwl-prod`) - is reused across all five components so they read as one
 * product with one dataset, not five unrelated mockups. Observation window is a
 * single afternoon: 2026-10-14, 12:35–14:31 UTC.
 *
 * NAMING SCHEME (keep consistent if you extend this)
 *   servers        <role>-<function>-prod-<nn>   payment-api-prod-03
 *   edge nodes     edge-waf-<iata>-<nn>          edge-waf-lhr-02
 *   workstations   NWL-WS-<4 digits>             NWL-WS-2290
 *   laptops        NWL-LT-<4 digits>             NWL-LT-4417
 *   server subnet  10.42.18.0/24
 *   client subnet  10.42.26.0/23
 *   DMZ subnet     10.42.9.0/24
 *   service accts  svc-<function>                svc-billing-worker
 *   user accts     <initial>.<surname>           d.okafor
 *   alert ids      ENX-<5 digits>                ENX-88214
 *   incident ids   INC-<year>-<4 digits>         INC-2026-0417
 */

/* ============================================================================
   TYPES
   ============================================================================ */

/** The only five severities. These map 1:1 onto `--signal-*` tokens. */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

/** Ordered worst-first, for sorting and for legend order. */
export const SEVERITY_ORDER: readonly Severity[] = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
] as const

/** Human label. Always rendered as text - severity is never colour-only. */
export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
}

export type AlertState = 'triaging' | 'contained' | 'awaiting-client' | 'new' | 'monitoring'

export const ALERT_STATE_LABEL: Record<AlertState, string> = {
  new: 'New',
  triaging: 'Triaging',
  contained: 'Contained',
  'awaiting-client': 'Awaiting client',
  monitoring: 'Monitoring',
}

export interface MitreTechnique {
  /** e.g. `T1078.004` */
  id: string
  /** Real ATT&CK technique name. */
  name: string
}

export interface TriageNote {
  /** Mono timestamp, UTC, HH:MM:SS. */
  at: string
  analyst: string
  body: string
}

export interface Alert {
  id: string
  severity: Severity
  /** UTC wall-clock, `HH:MM:SS`. Date lives on `ESTATE.window`. */
  at: string
  /** Hostname or edge node this fired against. */
  asset: string
  /** Asset's address inside the estate. */
  assetIp: string
  /** The detection rule's name, as an analyst would read it. */
  detection: string
  technique: MitreTechnique
  /** Analyst initial + surname, or `-` when unassigned. */
  assignee: string
  state: AlertState
  /** Detection content version that produced this. */
  rule: string
  /** Populated only for the row that opens its detail drawer. */
  detail?: {
    summary: string
    /** Key/value evidence rows. Values in mono where `mono: true`. */
    evidence: { label: string; value: string; mono?: boolean }[]
    notes: TriageNote[]
    /** The analyst's call. This is what separates triage from a notification. */
    conclusion: {
      verdict: string
      analyst: string
      at: string
      action: string
      incident: string
    }
  }
}

export type EndpointStatus = 'healthy' | 'isolated' | 'stale-telemetry' | 'detection'

export const ENDPOINT_STATUS_LABEL: Record<EndpointStatus, string> = {
  healthy: 'Healthy',
  isolated: 'Isolated',
  'stale-telemetry': 'Stale telemetry',
  detection: 'Detection',
}

/** Status → severity token, so the fleet view reuses the one severity palette. */
export const ENDPOINT_STATUS_SEVERITY: Record<EndpointStatus, Severity> = {
  detection: 'critical',
  isolated: 'high',
  'stale-telemetry': 'medium',
  healthy: 'low',
}

export interface Endpoint {
  host: string
  ip: string
  os: string
  /** Relative, as an EDR console renders it. */
  lastSeen: string
  status: EndpointStatus
  agent: string
}

export interface ProcessNode {
  name: string
  pid: number
  /** Full command line. The UI truncates and exposes the rest on hover/focus. */
  cmdline: string
  /** Truncated SHA-256, as consoles render it. */
  sha256: string
  /** Code-signing state. */
  signer: string
  /** Flagged nodes get a severity rail. */
  severity?: Severity
  children?: ProcessNode[]
}

export interface WafBucket {
  /** Bucket start, UTC `HH:MM`. */
  at: string
  allowed: number
  blocked: number
}

export interface WafRule {
  id: string
  name: string
  /** CRS paranoia level or `custom`. */
  source: string
  blocked: number
  severity: Severity
}

export interface SlaMetric {
  label: string
  value: string
  /** What the number actually measures. Vague metrics are a tell. */
  basis: string
}

export type DayState = 'full' | 'degraded' | 'maintenance'

export interface DayCell {
  /** Day of month, 1-indexed. */
  day: number
  state: DayState
  /** Human note for degraded/maintenance days. */
  note?: string
}

/* ============================================================================
   THE ESTATE
   ============================================================================ */

export const ESTATE = {
  tenant: 'Northwind Logistics Group',
  tenantRef: 'TEN-4471',
  estate: 'nwl-prod',
  /** The observation window every component shares. */
  window: {
    date: '2026-10-14',
    from: '12:35:00',
    to: '14:31:48',
    tz: 'UTC',
    label: '2026-10-14 12:35–14:31 UTC',
  },
  subnets: {
    server: '10.42.18.0/24',
    client: '10.42.26.0/23',
    dmz: '10.42.9.0/24',
  },
  /** The live incident every component is a different view of. */
  incident: {
    id: 'INC-2026-0417',
    title: 'Credential replay against the freight booking API',
    opened: '13:41:12',
    commander: 'M. Thorne',
    change: 'CHG-2026-1182',
  },
  /** Monitored asset counts. Deliberately not round. */
  coverage: {
    endpoints: 1_284,
    servers: 196,
    logSourcesHealthy: 312,
    logSourcesTotal: 317,
    eventsPerDay: '4.18 bn',
  },
} as const

/* ============================================================================
   SIEM, ALERT QUEUE
   A plausible afternoon: mostly medium and low, three criticals, one of which
   is the live incident. A queue that is half critical is not a queue, it is a
   marketing mock.
   ============================================================================ */

export const ALERTS: readonly Alert[] = [
  {
    id: 'ENX-88214',
    severity: 'critical',
    at: '14:22:07',
    asset: 'freight-booking-api-01',
    assetIp: '10.42.9.31',
    detection: 'Impossible travel followed by privileged API enumeration',
    technique: { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts' },
    assignee: 'M. Thorne',
    state: 'contained',
    rule: 'ENX-DET-0412 v7',
    detail: {
      summary:
        'Session for d.okafor authenticated from AS9009 (Bucharest) 91 seconds after a successful MFA sign-in from the London office range, then enumerated 1,106 booking records through /v2/consignments before the token was revoked.',
      evidence: [
        { label: 'Principal', value: 'd.okafor@northwind-logistics.example', mono: true },
        { label: 'Source address', value: '45.147.231.86', mono: true },
        { label: 'Source ASN', value: 'AS9009, M247 Europe SRL', mono: true },
        { label: 'Prior sign-in', value: '10.42.26.144 · 14:20:36 UTC', mono: true },
        { label: 'Session token', value: 'eyJhbGci…a3f1c9e4b2', mono: true },
        { label: 'Records touched', value: '1,106 of 48,312', mono: true },
        { label: 'Detection latency', value: '91 s from first anomalous call' },
      ],
      notes: [
        {
          at: '14:22:41',
          analyst: 'K. Osei',
          body: 'Confirmed the 14:20:36 sign-in is genuine, device NWL-LT-4417, compliant, MFA satisfied. The 14:22:07 session reuses the same refresh token from a hosting ASN. Token theft, not a shared account.',
        },
        {
          at: '14:24:09',
          analyst: 'M. Thorne',
          body: 'Pulled the browser credential store timeline on NWL-LT-4417. ENX-88209 fired on the same host at 14:03:58 for T1555.003. That is the acquisition step. Treating as one chain, not two alerts.',
        },
        {
          at: '14:26:55',
          analyst: 'M. Thorne',
          body: 'Revoked all refresh tokens for the principal, forced re-enrolment, isolated NWL-LT-4417. Client security lead (R. Venkatesan) acknowledged on the bridge at 14:26:12.',
        },
      ],
      conclusion: {
        verdict: 'True positive, confirmed credential theft and replay. No data exfiltration observed.',
        analyst: 'M. Thorne',
        at: '14:29:33',
        action:
          'Tokens revoked, host isolated, egress to AS9009 blocked at the edge. 1,106 accessed records enumerated for the client’s notification assessment; booking payloads are not special-category data.',
        incident: 'INC-2026-0417',
      },
    },
  },
  {
    id: 'ENX-88209',
    severity: 'critical',
    at: '14:03:58',
    asset: 'NWL-LT-4417',
    assetIp: '10.42.26.144',
    detection: 'Chromium credential store read by unsigned binary',
    technique: {
      id: 'T1555.003',
      name: 'Credentials from Password Stores: Credentials from Web Browsers',
    },
    assignee: 'K. Osei',
    state: 'contained',
    rule: 'ENX-DET-0188 v12',
  },
  {
    id: 'ENX-88171',
    severity: 'critical',
    at: '13:41:12',
    asset: 'edge-waf-lhr-02',
    assetIp: '10.42.9.12',
    detection: 'Deserialisation attempt against booking gateway (CVE-2026-31847)',
    technique: { id: 'T1190', name: 'Exploit Public-Facing Application' },
    assignee: 'L. Dubois',
    state: 'contained',
    rule: 'ENX-DET-0301 v4',
  },
  {
    id: 'ENX-88196',
    severity: 'high',
    at: '13:57:44',
    asset: 'identity-broker-prod-02',
    assetIp: '10.42.18.22',
    detection: 'Password spray: 212 principals, 3 lockouts, single source',
    technique: { id: 'T1110.003', name: 'Brute Force: Password Spraying' },
    assignee: 'A. Rahimi',
    state: 'triaging',
    rule: 'ENX-DET-0077 v19',
  },
  {
    id: 'ENX-88188',
    severity: 'high',
    at: '13:52:19',
    asset: 'NWL-WS-2290',
    assetIp: '10.42.26.90',
    detection: 'rundll32 spawned from PowerShell with network callout',
    technique: { id: 'T1218.011', name: 'System Binary Proxy Execution: Rundll32' },
    assignee: 'K. Osei',
    state: 'contained',
    rule: 'ENX-DET-0144 v8',
  },
  {
    id: 'ENX-88163',
    severity: 'high',
    at: '13:36:02',
    asset: 'warehouse-sync-prod-04',
    assetIp: '10.42.18.41',
    detection: 'Defender real-time protection disabled via registry',
    technique: { id: 'T1562.001', name: 'Impair Defenses: Disable or Modify Tools' },
    assignee: 'J. Castellanos',
    state: 'awaiting-client',
    rule: 'ENX-DET-0092 v11',
  },
  {
    id: 'ENX-88150',
    severity: 'medium',
    at: '13:28:51',
    asset: 'svc-billing-worker-07',
    assetIp: '10.42.18.77',
    detection: 'Scheduled task created by service account outside change window',
    technique: { id: 'T1053.005', name: 'Scheduled Task/Job: Scheduled Task' },
    assignee: 'A. Rahimi',
    state: 'triaging',
    rule: 'ENX-DET-0210 v6',
  },
  {
    id: 'ENX-88142',
    severity: 'medium',
    at: '13:21:33',
    asset: 'payment-api-prod-03',
    assetIp: '10.42.18.53',
    detection: 'TLS certificate expires in 11 days, PCI in-scope service',
    technique: { id: 'T1190', name: 'Exploit Public-Facing Application' },
    assignee: 'L. Dubois',
    state: 'awaiting-client',
    rule: 'ENX-DET-0455 v2',
  },
  {
    id: 'ENX-88137',
    severity: 'medium',
    at: '13:14:06',
    asset: 'db-ledger-prod-01',
    assetIp: '10.42.18.9',
    detection: 'WMI process creation from unexpected parent (wsmprovhost)',
    technique: { id: 'T1047', name: 'Windows Management Instrumentation' },
    assignee: 'J. Castellanos',
    state: 'monitoring',
    rule: 'ENX-DET-0119 v15',
  },
  {
    id: 'ENX-88124',
    severity: 'medium',
    at: '13:02:48',
    asset: 'NWL-LT-3862',
    assetIp: '10.42.27.18',
    detection: 'Spearphishing link clicked, domain registered 4 days ago',
    technique: { id: 'T1566.002', name: 'Phishing: Spearphishing Link' },
    assignee: 'K. Osei',
    state: 'contained',
    rule: 'ENX-DET-0066 v23',
  },
  {
    id: 'ENX-88118',
    severity: 'low',
    at: '12:56:14',
    asset: 'reporting-etl-prod-05',
    assetIp: '10.42.18.64',
    detection: 'LLMNR response observed on server VLAN',
    technique: {
      id: 'T1557.001',
      name: 'Adversary-in-the-Middle: LLMNR/NBT-NS Poisoning and SMB Relay',
    },
    assignee: 'A. Rahimi',
    state: 'monitoring',
    rule: 'ENX-DET-0033 v9',
  },
  {
    id: 'ENX-88107',
    severity: 'low',
    at: '12:48:37',
    asset: 'NWL-WS-1174',
    assetIp: '10.42.26.22',
    detection: 'Local account created outside the joiner process',
    technique: { id: 'T1136.001', name: 'Create Account: Local Account' },
    assignee: '—',
    state: 'new',
    rule: 'ENX-DET-0128 v5',
  },
  {
    id: 'ENX-88099',
    severity: 'low',
    at: '12:41:20',
    asset: 'edge-waf-lhr-02',
    assetIp: '10.42.9.12',
    detection: 'Outbound DNS-over-HTTPS to non-approved resolver',
    technique: { id: 'T1572', name: 'Protocol Tunneling' },
    assignee: '—',
    state: 'new',
    rule: 'ENX-DET-0271 v3',
  },
  {
    id: 'ENX-88091',
    severity: 'info',
    at: '12:35:09',
    asset: 'identity-broker-prod-02',
    assetIp: '10.42.18.22',
    detection: 'Break-glass account checked out and returned (28 min)',
    technique: { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts' },
    assignee: 'J. Castellanos',
    state: 'monitoring',
    rule: 'ENX-DET-0009 v31',
  },
]

/** Toolbar filter chips. `count` is the number matching inside the window. */
export const ALERT_FILTERS: readonly { label: string; count: number; active?: boolean }[] = [
  { label: 'Open', count: 9, active: true },
  { label: 'Critical + High', count: 6 },
  { label: 'Assigned to me', count: 3 },
  { label: 'Last 2 h', count: 14, active: true },
  { label: 'Suppressed', count: 41 },
]

/** The alert that arrives during the recorded sequence (step 1 onward). */
export const INCOMING_ALERT: Alert = {
  id: 'ENX-88231',
  severity: 'high',
  at: '14:31:48',
  asset: 'freight-booking-api-01',
  assetIp: '10.42.9.31',
  detection: 'Refresh token replay rejected post-revocation, same ASN',
  technique: { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts' },
  assignee: 'M. Thorne',
  state: 'triaging',
  rule: 'ENX-DET-0412 v7',
}

/* ============================================================================
   SIEM, SEVERITY DISTRIBUTION
   24 h to 2026-10-14 14:31 UTC. 3 + 17 + 86 + 412 + 2,329 = 2,847.
   ============================================================================ */

export const SEVERITY_DISTRIBUTION: readonly { severity: Severity; count: number }[] = [
  { severity: 'critical', count: 3 },
  { severity: 'high', count: 17 },
  { severity: 'medium', count: 86 },
  { severity: 'low', count: 412 },
  { severity: 'info', count: 2_329 },
]

export const SEVERITY_TOTAL = SEVERITY_DISTRIBUTION.reduce((n, d) => n + d.count, 0) // 2847

/**
 * The gauge's headline: proportion of the 24 h signal that an analyst had to
 * read, rather than the proportion that was automatically closed. 518 of 2,847
 * reached a human - the rest were correlated or suppressed by content.
 */
export const GAUGE = {
  label: 'Analyst-reviewed share of signal',
  reviewed: 518,
  total: SEVERITY_TOTAL,
  window: '24 h to 2026-10-14 14:31 UTC',
  /** Auto-closed by correlation or suppression content. */
  autoClosed: 2_329,
} as const

/* ============================================================================
   EDR, FLEET
   48 of 1,284 monitored endpoints: the `nwl-prod` server VLAN plus the London
   client subnet. Fleet health is mostly healthy, which is what real fleets are.
   ============================================================================ */

type EndpointTuple = readonly [
  host: string,
  ip: string,
  os: string,
  lastSeen: string,
  status: EndpointStatus,
]

const ENDPOINT_TUPLES: readonly EndpointTuple[] = [
  ['NWL-LT-4417', '10.42.26.144', 'Win 11 24H2', 'isolated 14:26', 'isolated'],
  ['NWL-WS-2290', '10.42.26.90', 'Win 11 24H2', '31 s', 'detection'],
  ['warehouse-sync-prod-04', '10.42.18.41', 'Win Svr 2022', '48 s', 'detection'],
  ['NWL-LT-3862', '10.42.27.18', 'Win 11 23H2', '1 m 12 s', 'healthy'],
  ['freight-booking-api-01', '10.42.9.31', 'Ubuntu 24.04', '22 s', 'healthy'],
  ['payment-api-prod-03', '10.42.18.53', 'Ubuntu 24.04', '19 s', 'healthy'],
  ['svc-billing-worker-07', '10.42.18.77', 'Ubuntu 24.04', '26 s', 'healthy'],
  ['identity-broker-prod-02', '10.42.18.22', 'Win Svr 2022', '34 s', 'healthy'],
  ['db-ledger-prod-01', '10.42.18.9', 'RHEL 9.4', '17 s', 'healthy'],
  ['reporting-etl-prod-05', '10.42.18.64', 'Ubuntu 22.04', '2 d 06 h', 'stale-telemetry'],
  ['edge-waf-lhr-02', '10.42.9.12', 'Debian 12', '14 s', 'healthy'],
  ['edge-waf-ams-01', '10.42.9.13', 'Debian 12', '16 s', 'healthy'],
  ['NWL-WS-1174', '10.42.26.22', 'Win 11 24H2', '41 s', 'healthy'],
  ['NWL-WS-1182', '10.42.26.30', 'Win 11 24H2', '58 s', 'healthy'],
  ['NWL-WS-1206', '10.42.26.54', 'Win 11 23H2', '1 m 04 s', 'healthy'],
  ['NWL-WS-1231', '10.42.26.79', 'Win 11 24H2', '27 s', 'healthy'],
  ['NWL-WS-1248', '10.42.26.96', 'Win 10 22H2', '9 h 41 m', 'stale-telemetry'],
  ['NWL-WS-1263', '10.42.26.111', 'Win 11 24H2', '36 s', 'healthy'],
  ['NWL-WS-1277', '10.42.26.125', 'Win 11 24H2', '52 s', 'healthy'],
  ['NWL-WS-1290', '10.42.26.138', 'Win 11 24H2', '23 s', 'healthy'],
  ['NWL-LT-4402', '10.42.26.150', 'macOS 15.1', '44 s', 'healthy'],
  ['NWL-LT-4409', '10.42.26.157', 'macOS 15.1', '1 m 33 s', 'healthy'],
  ['NWL-LT-4421', '10.42.26.169', 'Win 11 24H2', '38 s', 'healthy'],
  ['NWL-LT-4438', '10.42.26.186', 'Win 11 24H2', '29 s', 'healthy'],
  ['NWL-LT-4446', '10.42.26.194', 'macOS 14.7', '4 d 11 h', 'stale-telemetry'],
  ['NWL-LT-4457', '10.42.26.205', 'Win 11 24H2', '47 s', 'healthy'],
  ['NWL-LT-4463', '10.42.26.211', 'Win 11 24H2', '1 m 18 s', 'healthy'],
  ['NWL-LT-4478', '10.42.26.226', 'Win 11 23H2', '33 s', 'healthy'],
  ['NWL-LT-4491', '10.42.26.239', 'Win 11 24H2', '21 s', 'healthy'],
  ['NWL-WS-2304', '10.42.27.48', 'Win 11 24H2', '55 s', 'healthy'],
  ['NWL-WS-2318', '10.42.27.62', 'Win 11 24H2', '42 s', 'healthy'],
  ['NWL-WS-2327', '10.42.27.71', 'Win 10 22H2', '1 m 09 s', 'healthy'],
  ['NWL-WS-2341', '10.42.27.85', 'Win 11 24H2', '18 s', 'healthy'],
  ['NWL-WS-2356', '10.42.27.100', 'Win 11 24H2', '36 s', 'healthy'],
  ['NWL-WS-2369', '10.42.27.113', 'Win 11 24H2', '1 m 51 s', 'healthy'],
  ['NWL-WS-2374', '10.42.27.118', 'Win 11 24H2', '24 s', 'healthy'],
  ['api-gateway-prod-02', '10.42.18.14', 'Ubuntu 24.04', '15 s', 'healthy'],
  ['api-gateway-prod-03', '10.42.18.15', 'Ubuntu 24.04', '13 s', 'healthy'],
  ['queue-broker-prod-01', '10.42.18.28', 'Ubuntu 24.04', '20 s', 'healthy'],
  ['queue-broker-prod-02', '10.42.18.29', 'Ubuntu 24.04', '25 s', 'healthy'],
  ['tms-core-prod-01', '10.42.18.34', 'Win Svr 2022', '30 s', 'healthy'],
  ['tms-core-prod-02', '10.42.18.35', 'Win Svr 2022', '32 s', 'healthy'],
  ['file-relay-prod-01', '10.42.18.46', 'RHEL 9.4', '28 s', 'healthy'],
  ['backup-vault-prod-01', '10.42.18.58', 'RHEL 9.4', '1 m 02 s', 'healthy'],
  ['jump-bastion-prod-01', '10.42.18.2', 'Debian 12', '12 s', 'healthy'],
  ['build-runner-prod-06', '10.42.18.82', 'Ubuntu 24.04', '39 s', 'healthy'],
  ['build-runner-prod-07', '10.42.18.83', 'Ubuntu 24.04', '1 m 26 s', 'healthy'],
  ['print-relay-lhr-01', '10.42.26.4', 'Win Svr 2019', '6 h 18 m', 'stale-telemetry'],
]

export const ENDPOINTS: readonly Endpoint[] = ENDPOINT_TUPLES.map(
  ([host, ip, os, lastSeen, status]) => ({
    host,
    ip,
    os,
    lastSeen,
    status,
    agent: os.startsWith('macOS') ? 'enxagent 6.4.1' : 'enxagent 6.4.2',
  }),
)

export const FLEET_SUMMARY = {
  shown: ENDPOINTS.length,
  monitored: ESTATE.coverage.endpoints,
  byStatus: {
    healthy: ENDPOINTS.filter((e) => e.status === 'healthy').length,
    detection: ENDPOINTS.filter((e) => e.status === 'detection').length,
    isolated: ENDPOINTS.filter((e) => e.status === 'isolated').length,
    'stale-telemetry': ENDPOINTS.filter((e) => e.status === 'stale-telemetry').length,
  } satisfies Record<EndpointStatus, number>,
} as const

/* ============================================================================
   EDR, DETECTION DETAIL (process tree for ENX-88188 on NWL-WS-2290)
   ============================================================================ */

export const PROCESS_TREE: ProcessNode = {
  name: 'winlogbeat.exe',
  pid: 3_148,
  cmdline: '"C:\\Program Files\\Elastic\\Beats\\winlogbeat\\winlogbeat.exe" --environment=windows_service -c "C:\\ProgramData\\Elastic\\Beats\\winlogbeat\\winlogbeat.yml" --path.home "C:\\Program Files\\Elastic\\Beats\\winlogbeat"',
  sha256: '7b21d4f08ac6e319',
  signer: 'Elasticsearch B.V., valid',
  children: [
    {
      name: 'powershell.exe',
      pid: 7_412,
      cmdline:
        'powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANAA3AC8AcwAuAHAAcwAxACcAKQA=',
      sha256: 'c04e9b1a77f2d8e5',
      signer: 'Microsoft Windows, valid',
      severity: 'high',
      children: [
        {
          name: 'rundll32.exe',
          pid: 7_908,
          cmdline:
            'rundll32.exe C:\\Users\\m.halvorsen\\AppData\\Local\\Temp\\wmiprvse_cache.dll,#1 /tenant 4471 /relay 185.220.101.47:8443',
          sha256: 'a3f1c9e4b27d8054',
          signer: 'Unsigned, no Authenticode catalogue entry',
          severity: 'critical',
          children: [
            {
              name: 'conhost.exe',
              pid: 8_044,
              cmdline: '\\??\\C:\\Windows\\system32\\conhost.exe 0xffffffff -ForceV1',
              sha256: '1f6c8ba02de74913',
              signer: 'Microsoft Windows, valid',
              severity: 'info',
            },
          ],
        },
      ],
    },
  ],
}

export const CONTAINMENT = {
  action: 'Network isolation, management channel retained',
  host: 'NWL-WS-2290',
  at: '13:54:02',
  date: '2026-10-14',
  authorisedBy: 'K. Osei',
  role: 'Senior analyst, Envenox SOC',
  /** Mandate reference - the client pre-authorised unilateral containment. */
  mandate: 'Pre-authorised under MSA-4471 Schedule 3 §2.4 (contain-first)',
  elapsed: '1 m 43 s from detection',
  /** Artefacts taken before isolation, because isolation destroys volatile state. */
  artefacts: [
    { label: 'Memory image', value: 'NWL-WS-2290-20261014T135358Z.lime', mono: true },
    { label: 'Dropped DLL', value: 'a3f1c9e4b27d8054 · 184,320 bytes', mono: true },
    { label: 'Netflow slice', value: '13:51:08 → 13:54:02 UTC', mono: true },
  ],
  reversedAt: null as string | null,
} as const

/* ============================================================================
   WAF, TRAFFIC
   24 five-minute buckets, 12:35 → 14:30 UTC. The probe burst lands 14:00–14:20.
   ============================================================================ */

export const WAF_BUCKETS: readonly WafBucket[] = [
  { at: '12:35', allowed: 9_412, blocked: 61 },
  { at: '12:40', allowed: 9_877, blocked: 54 },
  { at: '12:45', allowed: 10_204, blocked: 72 },
  { at: '12:50', allowed: 10_661, blocked: 88 },
  { at: '12:55', allowed: 10_318, blocked: 67 },
  { at: '13:00', allowed: 11_042, blocked: 93 },
  { at: '13:05', allowed: 11_519, blocked: 104 },
  { at: '13:10', allowed: 11_206, blocked: 79 },
  { at: '13:15', allowed: 10_884, blocked: 118 },
  { at: '13:20', allowed: 11_371, blocked: 142 },
  { at: '13:25', allowed: 11_803, blocked: 97 },
  { at: '13:30', allowed: 12_117, blocked: 133 },
  { at: '13:35', allowed: 11_942, blocked: 206 },
  { at: '13:40', allowed: 11_488, blocked: 1_204 },
  { at: '13:45', allowed: 10_973, blocked: 861 },
  { at: '13:50', allowed: 11_206, blocked: 418 },
  { at: '13:55', allowed: 11_644, blocked: 237 },
  { at: '14:00', allowed: 11_018, blocked: 1_662 },
  { at: '14:05', allowed: 10_477, blocked: 1_908 },
  { at: '14:10', allowed: 10_219, blocked: 1_743 },
  { at: '14:15', allowed: 10_806, blocked: 1_129 },
  { at: '14:20', allowed: 11_392, blocked: 604 },
  { at: '14:25', allowed: 11_817, blocked: 288 },
  { at: '14:30', allowed: 12_046, blocked: 171 },
]

export const WAF_TOTALS = {
  allowed: WAF_BUCKETS.reduce((n, b) => n + b.allowed, 0),
  blocked: WAF_BUCKETS.reduce((n, b) => n + b.blocked, 0),
  get requests() {
    return this.allowed + this.blocked
  },
  /** Blocked as a share of all requests, to 2 dp. */
  get blockedPct() {
    return ((this.blocked / (this.allowed + this.blocked)) * 100).toFixed(2)
  },
  p95Latency: '41 ms',
  origin: 'edge-waf-lhr-02 · edge-waf-ams-01',
} as const

export const WAF_RULES: readonly WafRule[] = [
  {
    id: '944130',
    name: 'Java deserialisation, suspicious payload in request body',
    source: 'CRS 4.7 · PL2',
    blocked: 4_118,
    severity: 'critical',
  },
  {
    id: 'NWL-0042',
    name: 'Booking gateway, Content-Type allow-list violation',
    source: 'Custom · tenant TEN-4471',
    blocked: 2_604,
    severity: 'high',
  },
  {
    id: '942100',
    name: 'SQL injection detected via libinjection',
    source: 'CRS 4.7 · PL1',
    blocked: 1_883,
    severity: 'high',
  },
  {
    id: '913100',
    name: 'Security scanner user-agent',
    source: 'CRS 4.7 · PL1',
    blocked: 1_247,
    severity: 'medium',
  },
  {
    id: '930110',
    name: 'Path traversal attack (/../)',
    source: 'CRS 4.7 · PL1',
    blocked: 806,
    severity: 'medium',
  },
  {
    id: '941110',
    name: 'XSS filter, script tag vector',
    source: 'CRS 4.7 · PL1',
    blocked: 471,
    severity: 'low',
  },
  {
    id: '949110',
    name: 'Inbound anomaly score exceeded (threshold 5)',
    source: 'CRS 4.7 · PL1',
    blocked: 288,
    severity: 'low',
  },
]

/**
 * One blocked request, rendered in full. The payload excerpt is stored as a
 * plain string and rendered as text content - React escapes it on output, and
 * the component truncates it visibly rather than silently.
 */
export const BLOCKED_REQUEST = {
  id: 'req_9f41c7b208de',
  at: '14:05:33.812',
  rule: '944130',
  ruleName: 'Java deserialisation, suspicious payload in request body',
  cve: 'CVE-2026-31847',
  severity: 'critical' as Severity,
  action: 'Blocked, connection reset, origin never contacted',
  method: 'POST',
  path: '/v2/consignments/import?format=legacy',
  host: 'booking.northwind-logistics.example',
  sourceIp: '185.220.101.47',
  sourceAsn: 'AS9009, M247 Europe SRL',
  sourceCountry: 'RO',
  userAgent: 'Apache-HttpClient/5.3.1 (Java/17.0.11)',
  anomalyScore: 23,
  bodyBytes: 4_912,
  /** Truncated deliberately; the UI says so rather than hiding it. */
  payloadExcerpt:
    'rO0ABXNyABdqYXZhLnV0aWwuUHJpb3JpdHlRdWV1ZZTaMLT7P4KxAwACSQAEc2l6ZUwACmNvbXBhcmF0b3J0ABZMamF2YS91dGlsL0NvbXBhcmF0b3I7eHAAAAACc3IAK29yZy5hcGFjaGUuY29tbW9ucy5jb2xsZWN0aW9uczQuY29tcGFyYXRvcnM=',
  payloadBytesShown: 212,
  matchedToken: 'java.util.PriorityQueue',
  repeatCount: 4_118,
  firstSeen: '13:40:17',
  lastSeen: '14:21:02',
} as const

/* ============================================================================
   SLA
   Window is named on every figure. A round three-nines figure is a marketing
   number; a real availability report carries the measured window, the figure to
   the precision it was actually measured to, and the minutes lost.
   ============================================================================ */

export const SLA_WINDOW = {
  label: '1–31 October 2026',
  hours: 744,
  minutes: 44_640,
} as const

export const SLA_UPTIME = {
  /** 8 m 03 s lost of 44,640 min → 99.98199%, reported to 3 dp. */
  value: '99.982%',
  target: '99.950%',
  minutesLost: '8 m 03 s',
  basis: `Edge availability, ${SLA_WINDOW.label} (${SLA_WINDOW.hours} h), measured from 6 external probes at 30 s intervals`,
} as const

export const SLA_PERCENTILES: readonly SlaMetric[] = [
  {
    label: 'p50',
    value: '4 m 12 s',
    basis: 'Human acknowledgement of a Critical or High alert',
  },
  { label: 'p95', value: '11 m 38 s', basis: 'Human acknowledgement of a Critical or High alert' },
  { label: 'p99', value: '21 m 04 s', basis: 'Human acknowledgement of a Critical or High alert' },
]

export const SLA_CONTAINMENT: readonly SlaMetric[] = [
  { label: 'p50', value: '9 m 27 s', basis: 'Detection to containment action, Critical only' },
  { label: 'p95', value: '26 m 51 s', basis: 'Detection to containment action, Critical only' },
  { label: 'p99', value: '38 m 19 s', basis: 'Detection to containment action, Critical only' },
]

export const SLA_TICKETS: readonly { state: string; count: number; note: string }[] = [
  { state: 'Open', count: 23, note: 'with an Envenox analyst' },
  { state: 'Awaiting client', count: 11, note: 'median wait 2 d 04 h' },
  { state: 'In change', count: 14, note: `under ${ESTATE.incident.change} and 6 others` },
  { state: 'Resolved (30 d)', count: 196, note: 'median age at close 1 d 11 h' },
  { state: 'Reopened (30 d)', count: 4, note: '2.0% of closures' },
]

/** October 2026 - 31 cells. Two degraded days account for the 8 m 03 s lost. */
export const SLA_DAYS: readonly DayCell[] = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1
  if (day === 14) {
    return { day, state: 'degraded', note: '5 m 12 s, edge-waf-ams-01 BGP reconvergence' }
  }
  if (day === 22) {
    return { day, state: 'degraded', note: '2 m 51 s, TLS terminator rolling restart' }
  }
  if (day === 6 || day === 20) {
    return { day, state: 'maintenance', note: 'Scheduled, announced 10 d ahead, no requests lost' }
  }
  return { day, state: 'full' }
})

export const DAY_STATE_LABEL: Record<DayState, string> = {
  full: 'Full availability',
  degraded: 'Degraded',
  maintenance: 'Planned maintenance',
}

export const DAY_STATE_SEVERITY: Record<DayState, Severity> = {
  full: 'low',
  degraded: 'medium',
  maintenance: 'info',
}

/* ============================================================================
   CAPTION DEFAULTS
   Each component takes `caption` as a REQUIRED prop so it cannot be dropped by
   accident, and defaults to an honest one.
   ============================================================================ */

export const CAPTIONS = {
  soc: 'Representative view of the managed SIEM console. Illustrative data, not a client estate.',
  edr: 'Representative view of the managed EDR fleet console. Illustrative data, not a client estate.',
  waf: 'Representative view of the hosted WAF traffic panel. Illustrative data, not a client estate.',
  gauge:
    'Representative view of the 24-hour signal breakdown. Illustrative data, not a client estate.',
  sla: 'Representative view of the service-level report. Illustrative data, not a client estate.',
  pipeline:
    'Representative view of the delivery pipeline. Illustrative data, not a client system.',
  sprint:
    'Representative view of the delivery board. Illustrative data, not a client system.',
  review:
    'Representative view of a pull request under review. Illustrative data, not a client system.',
  release:
    'Representative view of post-release health. Illustrative data, not a client system.',
  erp: 'Representative view of a month-end close. Illustrative data, not a client system.',
} as const

/* ============================================================================
   ============================================================================
   SOFTWARE DELIVERY, THE SAME COMPANY'S BUILD SYSTEMS
   ============================================================================

   Everything below is the DELIVERY side of the same fictional engagement the
   security fixtures above describe. It is deliberately not a second estate:
   the tenant is still Northwind Logistics Group (`TEN-4471`, estate
   `nwl-prod`), the build runners are `build-runner-prod-06` and `-07` from
   ENDPOINTS, the API host is `freight-booking-api-01`, the service accounts
   keep the `svc-` prefix, and the change reference is still `CHG-2026-1182`.
   Read together, the consoles are views of ONE company's systems on one
   afternoon, which is the whole reason to share a fixture file.

   The cross-references are load-bearing, not decoration:
     · the integration test that fails in the pipeline asserts the SAME tenant
       predicate whose absence let ENX-88214 enumerate 1,106 records;
     · the pull request that fixes it is ticket NWL-4471 on the sprint board;
     · the rollback on 2026-10-12 is ticket NWL-4489 on the same board;
     · the p99 on /v2/consignments/summary is ticket NWL-4495;
     · the purchase-order threshold control in the close is ticket NWL-4437;
     · the legacy import format rejected by ticket NWL-4412 is the path the WAF
       blocked in BLOCKED_REQUEST.

   EXTENDED NAMING SCHEME (keep consistent if you add more)
     delivery tickets   NWL-<4 digits>            NWL-4471
     pipeline runs      run <4 digits>            run 2184
     commits            7 hex chars               a3f1c9e
     branches           <type>/<kebab-subject>    fix/consignment-tenant-predicate
     findings           ENX-FND-<4 digits>        ENX-FND-0217
     finance controls   FIN-<AREA>-<2 digits>     FIN-SOD-02
     nominal accounts   4 digits                  4000
   ============================================================================ */

/* ----------------------------------------------------------- shared types -- */

/** One status vocabulary for every delivery surface. */
export type RunStatus = 'passed' | 'failed' | 'warned' | 'skipped' | 'running'

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  passed: 'Passed',
  failed: 'Failed',
  warned: 'Warning',
  skipped: 'Skipped',
  running: 'Running',
}

/** Status → severity token, so delivery reuses the ONE severity palette. */
export const RUN_STATUS_SEVERITY: Record<RunStatus, Severity> = {
  failed: 'critical',
  warned: 'medium',
  passed: 'low',
  skipped: 'info',
  running: 'info',
}

/* ============================================================================
   CI/CD: ONE PIPELINE RUN
   Run 2184 on `main`, 2026-10-14. It FAILS, at the integration stage, on an
   authorisation contract test. A pipeline where every stage is green is a
   marketing mock: the interesting thing a pipeline does is stop.
   ============================================================================ */

export interface PipelineStage {
  name: string
  /** What the stage actually ran. */
  tool: string
  status: RunStatus
  /** `M:SS`, or an em dash where the stage never started. */
  duration: string
  /** The one fact worth printing beside the stage. */
  detail: string
}

export const PIPELINE = {
  repo: 'northwind/freight-booking-api',
  pipeline: 'release · main',
  run: '2184',
  trigger: 'merge to main',
  commit: 'a3f1c9e',
  commitFull: 'a3f1c9e4b27d80541f6c8ba02de74913c04e9b1a',
  branch: 'feat/invoice-batching',
  author: 'D. Marchetti',
  message: 'Batch consignment invoices by settlement window',
  date: '2026-10-14',
  queuedFor: '00:11',
  startedAt: '13:58:02',
  finishedAt: '14:13:47',
  wallClock: '15:45',
  runner: 'build-runner-prod-06',
  runnerIp: '10.42.18.82',
  artefact: 'freight-booking-api-2184.tar.zst',
  artefactSize: '48.7 MB',
  artefactDigest: 'sha256:7b21d4f08ac6e319',
  change: ESTATE.incident.change,
  status: 'failed' as RunStatus,
} as const

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  { name: 'checkout', tool: 'git', status: 'passed', duration: '0:04', detail: 'a3f1c9e · shallow, depth 50' },
  { name: 'restore cache', tool: 'pnpm store', status: 'passed', duration: '0:09', detail: 'hit: 1,902 packages, 0 fetched' },
  { name: 'install', tool: 'pnpm install --frozen-lockfile', status: 'passed', duration: '0:21', detail: 'lockfile unchanged' },
  { name: 'lint', tool: 'eslint', status: 'passed', duration: '0:38', detail: '0 errors, 11 warnings (budget 25)' },
  { name: 'typecheck', tool: 'tsc --noEmit', status: 'passed', duration: '1:02', detail: '1,486 files, 0 errors' },
  { name: 'unit', tool: 'vitest run', status: 'passed', duration: '2:17', detail: '1,906 passed · 4 skipped · 88.2% lines' },
  { name: 'build', tool: 'next build', status: 'passed', duration: '3:41', detail: '48.7 MB artefact, zstd-19' },
  { name: 'sast', tool: 'semgrep --config p/ci', status: 'passed', duration: '0:54', detail: '0 blocking · 3 informational' },
  { name: 'dependency audit', tool: 'osv-scanner', status: 'warned', duration: '0:22', detail: '2 advisories, neither reachable from an entrypoint' },
  { name: 'container', tool: 'buildkit + cosign', status: 'passed', duration: '1:28', detail: 'signed · sha256:7b21d4f08ac6e319' },
  { name: 'integration', tool: 'vitest --project integration', status: 'failed', duration: '2:54', detail: '1 failed of 212: tenant scoping' },
  { name: 'deploy staging', tool: 'argocd sync', status: 'skipped', duration: '—', detail: 'gate: integration must pass' },
  { name: 'smoke', tool: 'playwright --project smoke', status: 'skipped', duration: '—', detail: 'gate: deploy staging must pass' },
  { name: 'promote production', tool: 'argocd sync', status: 'skipped', duration: '—', detail: 'gate: smoke must pass · CHG-2026-1182' },
]

/**
 * The failing stage's log, as the console prints it. Stored line by line so the
 * component can mark the assertion without parsing text at render time.
 */
export const PIPELINE_LOG: readonly { text: string; kind?: 'fail' | 'focus' | 'muted' }[] = [
  { text: '$ vitest run --project integration --reporter=verbose', kind: 'muted' },
  { text: ' FAIL  test/integration/consignments.authz.spec.ts', kind: 'fail' },
  { text: '   tenant scoping > reporting summary rejects a cross-tenant read' },
  { text: '' },
  { text: '   AssertionError: expected status 403, received 200', kind: 'focus' },
  { text: '    at consignments.authz.spec.ts:118:22' },
  { text: '' },
  { text: '    116 |   const res = await client(OTHER_TENANT).get(route)' },
  { text: '    117 |' },
  { text: '    118 |   expect(res.status).toBe(403)', kind: 'focus' },
  { text: '        |                      ^' },
  { text: '    119 |   expect(res.body.rows).toHaveLength(0)' },
  { text: '' },
  { text: '    route          GET /v2/consignments/summary' },
  { text: '    tenant         TEN-4471     principal  svc-reporting-export' },
  { text: '    rows returned  1,106        expected   0', kind: 'focus' },
  { text: '' },
  { text: '  Tests    1 failed · 211 passed (212)' },
  { text: '  Duration 2:54  (setup 0:19, containers 0:31)', kind: 'muted' },
]

/**
 * The four delivery metrics, each with the thing it actually measures named
 * beside it. A delivery metric without its window and its denominator is a
 * poster rather than a measurement - the same rule the SLA panel obeys.
 */
export const DELIVERY_METRICS: readonly SlaMetric[] = [
  {
    label: 'Lead time for change',
    value: '3 h 41 m',
    basis: 'p50, first commit on a branch to running in production. 1,026 changes in the 90 days to 2026-10-14.',
  },
  {
    label: 'Deployment frequency',
    value: '11.4 / day',
    basis: 'Median production deploys per calendar day across the same 1,026 changes, weekends included.',
  },
  {
    label: 'Change failure rate',
    value: '4.7%',
    basis: '48 of those 1,026 deploys needed a rollback or a same-day fix forward.',
  },
  {
    label: 'Time to restore service',
    value: '18 m 22 s',
    basis: 'p50 across those 48, from the alert firing to the service reporting healthy again.',
  },
]

/* ============================================================================
   SPRINT BOARD
   Sprint 34, day 8 of 10. FIVE of the fifteen tickets came from the security
   practice and sit in the same columns, with the same points and the same
   refinement, as the features. That is the company's argument made visible:
   there is no separate security backlog to deprioritise, because there is no
   separate security backlog.
   ============================================================================ */

export type TicketColumn = 'ready' | 'progress' | 'review' | 'done'

export const TICKET_COLUMN_LABEL: Record<TicketColumn, string> = {
  ready: 'Ready',
  progress: 'In progress',
  review: 'In review',
  done: 'Done',
}

export interface Ticket {
  id: string
  title: string
  /** Initial and surname, or an em dash where nobody has picked it up. */
  assignee: string
  points: number
  labels: readonly string[]
  column: TicketColumn
  /** Set only on tickets the security practice raised. */
  severity?: Severity
  /** Where a security ticket came from. Printed, so provenance is checkable. */
  origin?: string
  /** One extra fact, where there is one worth the row. */
  note?: string
}

export const SPRINT = {
  board: 'Northwind, delivery',
  key: 'NWL',
  number: 34,
  from: '2026-10-05',
  to: '2026-10-16',
  dayOf: 'day 8 of 10',
  committed: 46,
  completed: 21,
  forecast: 38,
  carrying: 8,
  team: 'D. Marchetti · S. Bello · A. Whitfield · P. Lindqvist · K. Osei (security, 25%)',
  ceremony: 'Refined Tuesdays 14:00 UTC, with the security engineer in the room',
} as const

export const TICKETS: readonly Ticket[] = [
  /* ---- Ready ---- */
  {
    id: 'NWL-4488',
    title: 'Move the tenant predicate into reporting.consignment_summary itself',
    assignee: '—',
    points: 3,
    labels: ['security', 'authz'],
    column: 'ready',
    severity: 'low',
    origin: 'Follow-up raised in review on NWL-4471',
  },
  { id: 'NWL-4512', title: 'Group consolidated invoices by settlement window', assignee: 'S. Bello', points: 5, labels: ['feature', 'invoicing'], column: 'ready' },
  { id: 'NWL-4523', title: 'Rate-limit the public tracking endpoint at 60 rpm per source', assignee: '—', points: 2, labels: ['platform'], column: 'ready' },
  { id: 'NWL-4531', title: 'Replace the nightly CSV export with a signed object handoff', assignee: 'P. Lindqvist', points: 8, labels: ['platform', 'integration'], column: 'ready' },

  /* ---- In progress ---- */
  {
    id: 'NWL-4502',
    title: 'Second approver on support impersonation, with its own audit event',
    assignee: 'K. Osei',
    points: 3,
    labels: ['security', 'audit'],
    column: 'progress',
    severity: 'medium',
    origin: 'Threat model control 07, agreed before sprint 1',
  },
  {
    id: 'NWL-4489',
    title: 'Invoice batch idempotency key collides across settlement windows',
    assignee: 'A. Whitfield',
    points: 3,
    labels: ['bug', 'invoicing'],
    column: 'progress',
    note: 'Caused the rollback of release 2169 on 2026-10-12',
  },
  { id: 'NWL-4495', title: 'Consignment summary: p99 is 4.1 s over a three-year range', assignee: 'S. Bello', points: 5, labels: ['performance'], column: 'progress' },
  { id: 'NWL-4508', title: 'Carrier rate-card import: 11 of 1,904 rows fail validation', assignee: 'P. Lindqvist', points: 2, labels: ['data'], column: 'progress' },

  /* ---- In review ---- */
  {
    id: 'NWL-4471',
    title: 'Reporting summary returns rows for every tenant, not the caller’s',
    assignee: 'D. Marchetti',
    points: 5,
    labels: ['security', 'authz', 'regression'],
    column: 'review',
    severity: 'high',
    origin: 'Finding ENX-FND-0217 · continuous review, 2026-10-13',
    note: 'Pull request 482 · 2 of 2 required approvals given',
  },
  { id: 'NWL-4466', title: 'Idempotent retry for the carrier webhook consumer', assignee: 'A. Whitfield', points: 5, labels: ['bug', 'integration'], column: 'review' },
  { id: 'NWL-4458', title: 'Freight quote rounding is half-even, the contract says half-up', assignee: 'S. Bello', points: 2, labels: ['bug', 'invoicing'], column: 'review' },

  /* ---- Done ---- */
  { id: 'NWL-4441', title: 'Settlement window model and migration', assignee: 'S. Bello', points: 8, labels: ['feature', 'invoicing'], column: 'done' },
  {
    id: 'NWL-4437',
    title: 'Enforce the purchase-order approval threshold in the API, not the interface',
    assignee: 'P. Lindqvist',
    points: 5,
    labels: ['security', 'authz'],
    column: 'done',
    severity: 'high',
    origin: 'Finding ENX-FND-0203 · pre-go-live test, 2026-09-18',
  },
  {
    id: 'NWL-4429',
    title: 'Append-only audit log written to the evidence bucket',
    assignee: 'D. Marchetti',
    points: 5,
    labels: ['security', 'audit'],
    column: 'done',
    severity: 'medium',
    origin: 'Threat model control 02',
  },
  { id: 'NWL-4412', title: 'Reject the legacy consignment import format with a 415', assignee: 'A. Whitfield', points: 3, labels: ['hardening'], column: 'done' },
]

export const TICKET_COLUMNS: readonly TicketColumn[] = ['ready', 'progress', 'review', 'done']

/** Counted rather than asserted, so the sentence under the board cannot drift. */
export const SECURITY_TICKET_COUNT = TICKETS.filter((t) => t.labels.includes('security')).length

/* ============================================================================
   CODE REVIEW, PULL REQUEST 482
   The fix for NWL-4471. The review thread is the point: a security engineer
   writing in the pull request, inside the sprint, rather than in a report four
   months later that an engineer then has to translate.
   ============================================================================ */

export interface DiffLine {
  kind: 'context' | 'added' | 'removed' | 'hunk'
  /** Line number in the new file. `null` for removed lines and hunk headers. */
  n: number | null
  text: string
}

export interface ReviewComment {
  author: string
  role: string
  at: string
  body: string
}

export const PULL_REQUEST = {
  number: '482',
  repo: 'northwind/freight-booking-api',
  title: 'Scope the reporting summary to the caller’s tenant',
  branch: 'fix/consignment-tenant-predicate',
  base: 'main',
  author: 'D. Marchetti',
  ticket: 'NWL-4471',
  openedAt: '2026-10-14 09:12:40',
  mergedAt: '2026-10-14 14:33:18',
  headSha: '6f2ab84',
  commits: 3,
  filesChanged: 4,
  added: 38,
  removed: 11,
  state: 'Approved: 2 of 2 required reviews',
  file: 'src/reporting/consignment-summary.repository.ts',
} as const

export const PR_REVIEWERS: readonly {
  name: string
  role: string
  state: 'approved' | 'commented' | 'awaiting'
  at: string | null
}[] = [
  { name: 'K. Osei', role: 'Security practice, required', state: 'approved', at: '14:12:31' },
  { name: 'A. Whitfield', role: 'Code owner, consignments, required', state: 'approved', at: '14:31:05' },
  { name: 'P. Lindqvist', role: 'Code owner, reporting', state: 'commented', at: '11:02:44' },
]

export const PR_CHECKS: readonly {
  name: string
  status: RunStatus
  duration: string
  detail: string
}[] = [
  { name: 'typecheck', status: 'passed', duration: '1:02', detail: '1,486 files' },
  { name: 'unit', status: 'passed', duration: '2:17', detail: '1,906 passed' },
  { name: 'integration', status: 'passed', duration: '3:08', detail: '212 of 212, was 211 on run 2184' },
  { name: 'authz contract', status: 'passed', duration: '0:46', detail: '64 routes, 0 unscoped' },
  { name: 'lint', status: 'passed', duration: '0:38', detail: '11 warnings' },
  { name: 'sast · semgrep', status: 'passed', duration: '0:54', detail: '0 blocking' },
  { name: 'dependency audit', status: 'warned', duration: '0:22', detail: '2 advisories, neither reachable' },
  { name: 'preview deploy', status: 'passed', duration: '1:54', detail: 'pr-482.staging.nwl-prod.example' },
]

export const PR_DIFF: readonly DiffLine[] = [
  { kind: 'hunk', n: null, text: '@@ -142,10 +142,14 @@ class ConsignmentSummaryRepository {' },
  { kind: 'context', n: 142, text: '  async listForPeriod(' },
  { kind: 'context', n: 143, text: '    principal: Principal,' },
  { kind: 'context', n: 144, text: '    period: DateRange,' },
  { kind: 'context', n: 145, text: '  ): Promise<ConsignmentSummaryRow[]> {' },
  { kind: 'removed', n: null, text: '    // reporting.consignment_summary is already scoped by the view' },
  { kind: 'removed', n: null, text: '    return this.db.rows(sql`' },
  { kind: 'removed', n: null, text: '      select * from reporting.consignment_summary' },
  { kind: 'removed', n: null, text: '      where booked_at between ${period.from} and ${period.to}' },
  { kind: 'removed', n: null, text: '    `)' },
  { kind: 'added', n: 146, text: '    // The view is NOT scoped. ENX-FND-0217: the predicate lived in the' },
  { kind: 'added', n: 147, text: '    // single caller that existed in 2021. This is the second caller.' },
  { kind: 'added', n: 148, text: '    assertTenantScoped(principal)' },
  { kind: 'added', n: 149, text: '' },
  { kind: 'added', n: 150, text: '    return this.db.rows(sql`' },
  { kind: 'added', n: 151, text: '      select * from reporting.consignment_summary' },
  { kind: 'added', n: 152, text: '      where tenant_ref = ${principal.tenantRef}' },
  { kind: 'added', n: 153, text: '        and booked_at between ${period.from} and ${period.to}' },
  { kind: 'added', n: 154, text: '    `)' },
  { kind: 'context', n: 155, text: '  }' },
]

/** Anchored to line 148 - `assertTenantScoped(principal)`. */
export const PR_THREAD = {
  file: PULL_REQUEST.file,
  line: 148,
  anchor: 'assertTenantScoped(principal)',
  resolved: true,
  resolvedBy: 'A. Whitfield',
  resolvedAt: '14:30:12',
  comments: [
    {
      author: 'K. Osei',
      role: 'Security practice',
      at: '2026-10-14 11:48:02',
      body: 'This fixes this caller. The view still has no tenant predicate of its own, so whoever writes the third caller in 2028 repeats the bug and nothing catches it. Raise the follow-up before this merges, I will approve either way, but I want the ticket to exist.',
    },
    {
      author: 'D. Marchetti',
      role: 'Author',
      at: '2026-10-14 12:06:19',
      body: 'NWL-4488 raised and pointed into this sprint. Keeping the assertion here as well as in the view when that lands: two places that both have to be wrong beats one place that has to be right.',
    },
    {
      author: 'A. Whitfield',
      role: 'Code owner, consignments',
      at: '2026-10-14 14:29:51',
      body: 'assertTenantScoped throws for a principal with no tenant_ref, which is what svc-reporting-export runs as. Added that case to the authz contract suite so the path is covered rather than assumed: 64 routes, 0 unscoped.',
    },
  ] as readonly ReviewComment[],
} as const

/* ============================================================================
   RELEASE HEALTH
   14 days to 2026-10-14. Two rollbacks, both named and both carrying a ticket.
   NO MEAN LATENCY ANYWHERE: a mean hides the tail, and the tail is the product.
   Nobody is harmed by the median request; they are harmed by the p99 one.
   ============================================================================ */

export interface DeployDay {
  /** `DD MMM`, for the axis. */
  at: string
  date: string
  deploys: number
  /** 5xx as a percentage of requests, 2 dp. */
  errorPct: number
  weekend?: boolean
  rollback?: boolean
}

export const DEPLOY_DAYS: readonly DeployDay[] = [
  { at: '01 Oct', date: '2026-10-01', deploys: 14, errorPct: 0.08 },
  { at: '02 Oct', date: '2026-10-02', deploys: 11, errorPct: 0.07 },
  { at: '03 Oct', date: '2026-10-03', deploys: 2, errorPct: 0.05, weekend: true },
  { at: '04 Oct', date: '2026-10-04', deploys: 1, errorPct: 0.04, weekend: true },
  { at: '05 Oct', date: '2026-10-05', deploys: 16, errorPct: 0.09 },
  { at: '06 Oct', date: '2026-10-06', deploys: 13, errorPct: 0.22, rollback: true },
  { at: '07 Oct', date: '2026-10-07', deploys: 15, errorPct: 0.07 },
  { at: '08 Oct', date: '2026-10-08', deploys: 12, errorPct: 0.06 },
  { at: '09 Oct', date: '2026-10-09', deploys: 9, errorPct: 0.08 },
  { at: '10 Oct', date: '2026-10-10', deploys: 1, errorPct: 0.04, weekend: true },
  { at: '11 Oct', date: '2026-10-11', deploys: 0, errorPct: 0.03, weekend: true },
  { at: '12 Oct', date: '2026-10-12', deploys: 18, errorPct: 0.31, rollback: true },
  { at: '13 Oct', date: '2026-10-13', deploys: 14, errorPct: 0.12 },
  { at: '14 Oct', date: '2026-10-14', deploys: 11, errorPct: 0.06 },
]

export const RELEASE_WINDOW = {
  label: '01–14 October 2026',
  service: 'freight-booking-api',
  environment: 'production · nwl-prod',
  deploys: DEPLOY_DAYS.reduce((n, d) => n + d.deploys, 0),
  medianPerDay: '11.5',
  slo: '99.950% of requests served under 500 ms, rolling 28 days',
  errorBudget: '71.4% remaining at day 14',
  current: 'release 2183 · a3f1c9e pending on run 2184',
} as const

export interface LatencyRow {
  route: string
  method: string
  p50: string
  p95: string
  p99: string
  /** Requests per minute, median over the window. */
  rpm: string
  /** Set where the tail is the reason a ticket exists. */
  ticket?: string
  severity?: Severity
}

export const LATENCY_ROWS: readonly LatencyRow[] = [
  { method: 'GET', route: '/v2/tracking/:reference', p50: '11 ms', p95: '38 ms', p99: '97 ms', rpm: '14,480' },
  { method: 'GET', route: '/v2/consignments/:id', p50: '18 ms', p95: '54 ms', p99: '142 ms', rpm: '6,210' },
  { method: 'POST', route: '/v2/consignments', p50: '41 ms', p95: '128 ms', p99: '311 ms', rpm: '1,840' },
  { method: 'POST', route: '/v2/auth/token', p50: '62 ms', p95: '171 ms', p99: '388 ms', rpm: '1,104' },
  { method: 'POST', route: '/v2/invoices/batch', p50: '88 ms', p95: '402 ms', p99: '1,118 ms', rpm: '212' },
  {
    method: 'GET',
    route: '/v2/consignments/summary',
    p50: '214 ms',
    p95: '1,806 ms',
    p99: '4,112 ms',
    rpm: '96',
    ticket: 'NWL-4495',
    severity: 'medium',
  },
]

export interface RollbackEvent {
  release: string
  at: string
  date: string
  cause: string
  restoredIn: string
  rolledBackTo: string
  ticket: string
  severity: Severity
}

export const ROLLBACKS: readonly RollbackEvent[] = [
  {
    release: '2169',
    date: '2026-10-12',
    at: '11:42:18',
    cause: 'Invoice batch idempotency key collided across settlement windows. 41 duplicate invoices were raised before the rollback; all were voided the same morning and no customer was billed twice.',
    restoredIn: '6 m 11 s',
    rolledBackTo: '2168',
    ticket: 'NWL-4489',
    severity: 'high',
  },
  {
    release: '2141',
    date: '2026-10-06',
    at: '16:08:55',
    cause: 'A pool configuration change raised max clients above the database’s own limit; connections were refused for three minutes under afternoon load.',
    restoredIn: '3 m 02 s',
    rolledBackTo: '2140',
    ticket: 'NWL-4455',
    severity: 'medium',
  },
]

/* ============================================================================
   ERP, MONTH-END CLOSE
   Period 2026-10, closed in 2 working days against 9 before the replacement.
   The approval chain includes a BLOCKED self-approval, because a segregation
   of duties that is never seen firing is a policy rather than a control.
   ============================================================================ */

export type ReconState = 'reconciled' | 'noted' | 'awaiting' | 'cleared'

export const RECON_STATE_LABEL: Record<ReconState, string> = {
  reconciled: 'Reconciled',
  noted: 'Reconciled, noted',
  awaiting: 'Awaiting evidence',
  cleared: 'Cleared to zero',
}

export const RECON_STATE_SEVERITY: Record<ReconState, Severity> = {
  reconciled: 'low',
  noted: 'info',
  awaiting: 'medium',
  cleared: 'low',
}

export interface LedgerLine {
  account: string
  name: string
  /** Formatted with the currency symbol. An em dash where the side is unused. */
  debit: string
  credit: string
  source: string
  state: ReconState
  note?: string
}

export const CLOSE = {
  entity: 'Northwind Logistics Group Ltd',
  entityRef: ESTATE.tenantRef,
  ledger: 'General ledger, GL-01',
  period: 'October 2026',
  periodRef: '2026-10',
  currency: 'GBP',
  openedAt: '2026-11-02 08:00 UTC',
  approvedAt: '2026-11-03 11:06 UTC',
  closeDays: '2 working days',
  priorCloseDays: '9 working days',
  journalsPosted: '1,842',
  journalsOnHold: '3',
  debitTotal: '£7,306,619.29',
  creditTotal: '£7,306,619.29',
  variance: '£0.00',
  tolerance: '£500.00',
  fx: 'No foreign-currency revaluation in this period',
} as const

export const LEDGER_LINES: readonly LedgerLine[] = [
  { account: '1100', name: 'Trade debtors', debit: '£2,418,662.14', credit: '—', source: 'Sales ledger', state: 'reconciled' },
  { account: '1200', name: 'Bank, operating account', debit: '£684,207.93', credit: '—', source: 'Bank feed', state: 'reconciled' },
  { account: '1210', name: 'Bank, collections account', debit: '£184,320.00', credit: '—', source: 'Bank feed', state: 'reconciled' },
  {
    account: '1400',
    name: 'Stock, finished goods',
    debit: '£1,206,884.52',
    credit: '—',
    source: 'Warehouse management',
    state: 'noted',
    note: 'Three warehouses. One of them recorded stock adjustments with the sign reversed from a 2014 system change until the migration restated them; account 6200 below is that restatement, not a movement.',
  },
  { account: '2100', name: 'Trade creditors', debit: '—', credit: '£1,744,318.07', source: 'Purchase ledger', state: 'reconciled' },
  {
    account: '2200',
    name: 'VAT control',
    debit: '—',
    credit: '£312,446.80',
    source: 'VAT return, Q3',
    state: 'awaiting',
    note: 'The return acknowledgement had not reached the evidence store when the ledger was frozen. Carried as an open point on the approval rather than quietly ticked.',
  },
  { account: '2300', name: 'Accruals', debit: '—', credit: '£96,114.25', source: 'Manual journal', state: 'reconciled' },
  { account: '2400', name: 'Deferred revenue, unexpired contracts', debit: '—', credit: '£218,904.55', source: 'Billing', state: 'reconciled' },
  { account: '3100', name: 'Reserves brought forward', debit: '—', credit: '£311,314.56', source: 'Prior period', state: 'reconciled' },
  { account: '4000', name: 'Revenue, freight services', debit: '—', credit: '£3,881,402.66', source: 'Billing', state: 'reconciled' },
  { account: '4100', name: 'Revenue, warehousing', debit: '—', credit: '£742,118.40', source: 'Billing', state: 'reconciled' },
  { account: '5000', name: 'Cost of sales, subcontracted haulage', debit: '£2,114,776.31', credit: '—', source: 'Purchase ledger', state: 'reconciled' },
  {
    account: '6200',
    name: 'Stock valuation adjustment',
    debit: '£18,447.62',
    credit: '—',
    source: 'Manual journal',
    state: 'noted',
    note: 'Restatement of the sign reversal across eleven years. Reviewed by the Financial Controller and the migration lead; working paper WP-2026-10-14.',
  },
  { account: '7600', name: 'Payroll control', debit: '£608,112.44', credit: '—', source: 'Payroll import', state: 'reconciled' },
  { account: '8100', name: 'Depreciation', debit: '£71,208.33', credit: '—', source: 'Fixed asset register', state: 'reconciled' },
  {
    account: '9500',
    name: 'Suspense',
    debit: '£0.00',
    credit: '£0.00',
    source: '—',
    state: 'cleared',
    note: 'Cleared at 16:51 UTC on 2 November. A non-zero suspense account blocks the close under FIN-GL-07.',
  },
]

export interface ApprovalStep {
  step: number
  action: string
  name: string
  role: string
  at: string
  state: 'done' | 'blocked'
  control?: string
  note?: string
}

export const CLOSE_APPROVALS: readonly ApprovalStep[] = [
  { step: 1, action: 'Prepared', name: 'H. Ndiaye', role: 'Management accountant', at: '2026-11-02 17:42:08', state: 'done' },
  {
    step: 2,
    action: 'Approval attempted',
    name: 'H. Ndiaye',
    role: 'Management accountant',
    at: '2026-11-02 17:44:51',
    state: 'blocked',
    control: 'FIN-SOD-02',
    note: 'A preparer may not approve their own period. Refused server-side, and the attempt is written to the audit log rather than discarded, a control nobody can see firing is a policy.',
  },
  {
    step: 3,
    action: 'Reviewed',
    name: 'P. Lindqvist',
    role: 'Financial controller',
    at: '2026-11-03 09:18:36',
    state: 'done',
    note: 'Working papers WP-2026-10-11 through WP-2026-10-16 signed.',
  },
  {
    step: 4,
    action: 'Approved',
    name: 'J. Abara',
    role: 'Finance Director',
    at: '2026-11-03 11:06:14',
    state: 'done',
    note: 'Approved with account 2200 carried as an open point.',
  },
  {
    step: 5,
    action: 'Posted and locked',
    name: 'svc-close-runner',
    role: 'Service account',
    at: '2026-11-03 11:06:22',
    state: 'done',
    note: 'Period 2026-10 locked. Reopening needs two Finance Director approvals and raises a change record.',
  },
]

export const CLOSE_CONTROLS: readonly {
  ref: string
  name: string
  state: 'enforced' | 'exception'
  note: string
}[] = [
  {
    ref: 'FIN-SOD-02',
    name: 'A preparer may not approve their own period',
    state: 'enforced',
    note: '1 attempt refused this period, at 17:44:51 on 2 November.',
  },
  {
    ref: 'FIN-SOD-04',
    name: 'Purchase orders over £10,000.00 need a second approver',
    state: 'enforced',
    note: 'Enforced in the API, not only in the interface. Our own pre-go-live test found the threshold had existed in the interface alone; ticket NWL-4437 closed that on 2026-09-18.',
  },
  {
    ref: 'FIN-GL-07',
    name: 'Suspense must be zero before a period can close',
    state: 'enforced',
    note: 'Account 9500 cleared at 16:51 UTC on 2 November.',
  },
  {
    ref: 'FIN-GL-11',
    name: 'Manual journals over £25,000.00 need a second pair of eyes',
    state: 'enforced',
    note: '2 journals this period; both reviewed by the Financial Controller.',
  },
  {
    ref: 'FIN-EV-01',
    name: 'Every reconciliation carries its evidence',
    state: 'exception',
    note: '15 of 16 lines evidenced at freeze. Account 2200 is outstanding, see the approval chain.',
  },
]
